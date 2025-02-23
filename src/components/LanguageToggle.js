const LanguageToggle = ({ lang, setLang }) => {
  return (
    <button
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-200 transition-colors duration-300 focus:outline-none"
    >
      {/* Background colors for each side */}
      <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${lang === 'fr' ? 'bg-blue-600' : 'bg-red-600'}`} />
      
      {/* Sliding circle with flag */}
      <div
        className={`
          absolute flex h-6 w-6 transform items-center justify-center rounded-full bg-white 
          transition-transform duration-300 ${lang === 'fr' ? 'translate-x-9' : 'translate-x-1'}
        `}
      >
        {/* Flag display */}
        <div className="flex h-4 w-4 overflow-hidden rounded-sm">
          {lang === 'fr' ? (
            // French flag
            <div className="flex h-full w-full">
              <div className="h-full w-1/3 bg-blue-600"></div>
              <div className="h-full w-1/3 bg-white"></div>
              <div className="h-full w-1/3 bg-red-600"></div>
            </div>
          ) : (
            // UK flag - simplified version
            <div className="relative h-full w-full bg-blue-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[2px] w-full bg-white"></div>
                <div className="absolute h-full w-[2px] bg-white"></div>
                <div className="absolute h-full w-full">
                  <div className="absolute left-0 top-0 h-[2px] w-[45%] rotate-45 transform bg-red-600"></div>
                  <div className="absolute right-0 top-0 h-[2px] w-[45%] -rotate-45 transform bg-red-600"></div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-[45%] -rotate-45 transform bg-red-600"></div>
                  <div className="absolute bottom-0 right-0 h-[2px] w-[45%] rotate-45 transform bg-red-600"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      <span className={`absolute left-1 text-xs font-medium ${lang === 'fr' ? 'text-white/40' : 'text-white'}`}>
        EN
      </span>
      <span className={`absolute right-1 text-xs font-medium ${lang === 'fr' ? 'text-white' : 'text-white/40'}`}>
        FR
      </span>
    </button>
  );
};

export default LanguageToggle;