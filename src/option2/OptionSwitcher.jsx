import React from 'react';

// Small fixed pill in the top-right of the page, switching between the
// standalone option_1.html / option_2.html prototypes.
const OptionSwitcher = ({ current }) => {
  const options = [
    { id: 'option_1', label: 'Option 1', href: '/option_1.html' },
    { id: 'option_2', label: 'Option 2', href: '/option_2.html' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'var(--slateSurfaceWhite)',
        border: '1px solid var(--slateBorderLight)',
        borderRadius: 8,
        padding: 3,
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
      }}
    >
      {options.map((opt) => (
        <a
          key={opt.id}
          href={opt.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: "'Hanken Grotesk', sans-serif",
            color: opt.id === current ? 'var(--primarySurfaceDefault)' : 'var(--slateTextSubtle)',
            backgroundColor: opt.id === current ? 'var(--primarySurfaceSubtle)' : 'transparent',
          }}
        >
          {opt.label}
        </a>
      ))}
    </div>
  );
};

export default OptionSwitcher;
