const prisma = require('../../config/prisma');

// ---------- Scoring helpers ----------

function scoreInterestMatch(guideInterests, requestedInterests) {
  if (!requestedInterests || requestedInterests.length === 0) return null;
  if (!Array.isArray(guideInterests)) return 0;

  const matched = requestedInterests.filter((i) =>
    guideInterests.some((g) => g.toLowerCase() === i.toLowerCase())
  );
  return matched.length / requestedInterests.length;
}

function scoreBudget(hourlyRate, maxPrice) {
  if (!maxPrice) return null;
  if (hourlyRate === null || hourlyRate === undefined) return 0.5; // no price set → neutral
  if (hourlyRate <= maxPrice) return 1;
  // Linear falloff: at 2x maxPrice → 0
  const ratio = hourlyRate / maxPrice;
  if (ratio >= 2) return 0;
  return 2 - ratio; // 1 at <=maxPrice, 0 at 2x maxPrice
}

function scoreLanguage(guideLanguages, requestedLanguage) {
  if (!requestedLanguage) return null;
  if (!Array.isArray(guideLanguages)) return 0;
  return guideLanguages.some((l) => l.toLowerCase() === requestedLanguage.toLowerCase()) ? 1 : 0;
}

function scoreRating(avgRating, reviewCount) {
  if (reviewCount === 0) return 0.6; // neutral for new guides
  return Math.min(avgRating / 5, 1);
}

function scoreExperience(yearsOfExperience) {
  if (!yearsOfExperience || yearsOfExperience <= 0) return 0;
  return Math.min(yearsOfExperience / 10, 1);
}

// ---------- Main function ----------

async function recommendGuides(query) {
  const city = query.city.trim();

  // Stage 1: Hard filters
  const candidates = await prisma.guideProfile.findMany({
    where: {
      verificationStatus: 'APPROVED',
    },
    include: {
      user: { select: { id: true, name: true } },
      experiences: {
        where: { isActive: true },
      },
    },
  });

  // Filter: serve the city
  let filtered = candidates.filter((g) => {
    const areas = Array.isArray(g.serviceAreas) ? g.serviceAreas : [];
    const cityMatch = g.city.toLowerCase() === city.toLowerCase();
    const areaMatch = areas.some((a) => a.toLowerCase() === city.toLowerCase());
    return cityMatch || areaMatch;
  });

  // Filter: has active experience in the category (if category provided)
  if (query.category) {
    filtered = filtered.filter((g) =>
      g.experiences.some((e) => e.category === query.category)
    );
  }

  // Filter: has availability on date (if date provided)
  if (query.date) {
    // Availability module not implemented yet — skip for now.
    // When Availability is added, filter guides whose schedule includes this date.
  }

  // Stage 2: Weighted scoring
  const requestedInterests = query.interests
    ? query.interests.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const weights = {
    interest: 0.30,
    budget: 0.25,
    language: 0.20,
    rating: 0.15,
    experience: 0.10,
  };

  const scored = filtered.map((g) => {
    const interestScore = scoreInterestMatch(g.expertise, requestedInterests);
    const budgetScore = scoreBudget(g.hourlyRate, query.maxPrice ? parseInt(query.maxPrice) : null);
    const languageScore = scoreLanguage(g.languages, query.language);
    const ratingScore = scoreRating(g.avgRating, g.reviewCount);
    const experienceScore = scoreExperience(g.yearsOfExperience);

    // Dynamic weights — only include factors with non-null scores
    const activeWeights = { ...weights };
    if (interestScore === null) activeWeights.interest = 0;
    if (budgetScore === null) activeWeights.budget = 0;
    if (languageScore === null) activeWeights.language = 0;

    const totalWeight =
      activeWeights.interest +
      activeWeights.budget +
      activeWeights.language +
      activeWeights.rating +
      activeWeights.experience;

    const weightedSum =
      (interestScore ?? 0) * activeWeights.interest +
      (budgetScore ?? 0) * activeWeights.budget +
      (languageScore ?? 0) * activeWeights.language +
      ratingScore * activeWeights.rating +
      experienceScore * activeWeights.experience;

    const matchScore = totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 1000) / 10
      : 0;

    // Build reasons
    const reasons = [];
    if (interestScore !== null && interestScore > 0) {
      const matched = requestedInterests.filter((i) =>
        (g.expertise || []).some((x) => x.toLowerCase() === i.toLowerCase())
      );
      reasons.push('Matches your interests: ' + matched.join(', '));
    }
    if (budgetScore !== null && budgetScore >= 0.9) {
      reasons.push('Fits your budget');
    }
    if (languageScore === 1) {
      reasons.push('Speaks your preferred language');
    }
    if (g.verificationStatus === 'APPROVED') {
      reasons.push('Verified guide');
    }

    return {
      guideId: g.id,
      name: g.user.name,
      avatarUrl: g.avatarUrl,
      city: g.city,
      languages: g.languages,
      expertise: g.expertise,
      verificationStatus: g.verificationStatus,
      avgRating: g.avgRating,
      reviewCount: g.reviewCount,
      hourlyRate: g.hourlyRate,
      matchScore,
      reasons,
    };
  });

  // Sort descending by matchScore
  scored.sort((a, b) => b.matchScore - a.matchScore);

  const limit = Math.min(30, parseInt(query.limit) || 10);
  return scored.slice(0, limit);
}

module.exports = { recommendGuides };