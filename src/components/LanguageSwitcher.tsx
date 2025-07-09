'use client';

import type { SupportedLocale } from '@/api/patient-summaries/types';
import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LanguageOption = {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

type LanguageSwitcherProps = {
  currentLocale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  isUpdatingLocale?: boolean;
  isTranslating?: boolean;
  availableTranslations?: SupportedLocale[];
  variant?: 'default' | 'compact' | 'header';
};

export function LanguageSwitcher({
  currentLocale,
  onLocaleChange,
  isUpdatingLocale = false,
  isTranslating = false,
  availableTranslations = [],
  variant = 'default',
}: LanguageSwitcherProps) {
  const currentLanguage = LANGUAGES.find(lang => lang.code === currentLocale);

  const handleLanguageChange = (locale: SupportedLocale) => {
    if (locale === currentLocale || isTranslating || isUpdatingLocale) {
      return;
    }
    onLocaleChange(locale);
  };

  const isLoading = isTranslating || isUpdatingLocale;

  const isTranslationAvailable = (locale: SupportedLocale) => {
    return availableTranslations.includes(locale) || locale === currentLocale;
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="h-8 px-2"
          >
            <Globe className="w-4 h-4 mr-1" />
            <span className="text-xs">{currentLanguage?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGES.map(language => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isLoading}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span className="text-sm">{language.nativeName}</span>
              </div>
              <div className="flex gap-1">
                {language.code === currentLocale && (
                  <Badge variant="secondary" className="text-xs">Current</Badge>
                )}
                {isTranslationAvailable(language.code) && language.code !== currentLocale && (
                  <Badge variant="outline" className="text-xs">Available</Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'header') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="h-8 px-3 border border-black text-primary-foreground hover:bg-primary-foreground/10"
          >
            <span className="text-xs mr-2">Language</span>
            <Globe className="w-4 h-4 mr-1" />
            <span className="text-xs">{currentLanguage?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGES.map(language => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isLoading}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span className="text-sm">{language.nativeName}</span>
              </div>
              <div className="flex gap-1">
                {language.code === currentLocale && (
                  <Badge variant="secondary" className="text-xs">Current</Badge>
                )}
                {isTranslationAvailable(language.code) && language.code !== currentLocale && (
                  <Badge variant="outline" className="text-xs">Available</Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          className="justify-start"
        >
          <Globe className="w-4 h-4 mr-2" />
          <span className="mr-2">{currentLanguage?.flag}</span>
          <span>{currentLanguage?.nativeName || 'Select Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isLoading}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </div>
            </div>
            <div className="flex gap-1">
              {language.code === currentLocale && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
              {isTranslationAvailable(language.code) && language.code !== currentLocale && (
                <Badge variant="outline" className="text-xs">Available</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
