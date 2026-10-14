import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInput('');
    }
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div
      className="form-control d-flex flex-wrap align-items-center gap-1"
      style={{ minHeight: 44, paddingTop: 6, paddingBottom: 6 }}
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="gc-badge gc-badge-blue d-flex align-items-center gap-1"
          style={{ fontSize: '0.75rem' }}
        >
          {tag}
          <X
            size={12}
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
          />
        </span>
      ))}
      <input
        type="text"
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 80, background: 'transparent', fontSize: '0.9rem' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addTag}
        placeholder={value.length ? '' : placeholder}
      />
    </div>
  );
}