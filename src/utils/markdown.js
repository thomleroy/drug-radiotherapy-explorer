import React from 'react';
import { isSafeHttpUrl } from './security';

// Extremely small markdown-ish renderer for the About content. It supports:
//  - **bold** spans
//  - lines starting with ** as h3 headings
//  - bullet lines starting with "• " or "- "
//  - http(s) URLs auto-linked (validated via isSafeHttpUrl)
//  - blank lines as spacers
// Anything else is rendered verbatim.
export const renderMarkdownContent = (content, isDarkMode) => {
  if (typeof content !== 'string') return null;
  return content.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      const headerText = line.slice(2, -2);
      return (
        <h3
          key={index}
          className={`text-lg font-bold mt-6 mb-3
            ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
          `}
        >
          {headerText}
        </h3>
      );
    }

    if (line.startsWith('• ') || line.startsWith('- ')) {
      const bulletContent = line.slice(2);
      const parts = bulletContent.split(/(\*\*.*?\*\*)/g);
      return (
        <li
          key={index}
          className={`ml-4 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {parts.map((part, partIndex) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong
                key={partIndex}
                className={isDarkMode ? 'text-gray-100' : 'text-sfro-dark'}
              >
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </li>
      );
    }

    if (line.trim()) {
      const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s)]+)/g);
      return (
        <p
          key={index}
          className={`mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong
                  key={partIndex}
                  className={isDarkMode ? 'text-gray-100' : 'text-sfro-dark'}
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('http')) {
              if (isSafeHttpUrl(part)) {
                return (
                  <a
                    key={partIndex}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {part}
                  </a>
                );
              }
              return part;
            }
            return part;
          })}
        </p>
      );
    }

    return <div key={index} className="mb-2"></div>;
  });
};
