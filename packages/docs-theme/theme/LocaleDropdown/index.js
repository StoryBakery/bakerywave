import React, { useState, useRef, useEffect } from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import './styles.css';

export default function LocaleDropdown() {
    const { bakerywave } = useThemeConfig();
    const { i18n } = useDocusaurusContext();
    const location = useLocation();
    const config = bakerywave || {};
    const localeConfig = config.locale || {};
    const navbarConfig = config.navbar || {};

    // Locale Dropdown이 비활성화되면 렌더링하지 않음
    if (localeConfig.enabled === false || navbarConfig.showLocaleDropdown === false) {
        return null;
    }

    const { currentLocale, locales } = i18n;

    // 로케일이 1개 이하면 드롭다운 표시 안 함
    if (!locales || locales.length <= 1) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // 로케일 라벨 매핑
    const localeLabels = localeConfig.labels || {};
    const defaultLabels = {
        en: 'English',
        ko: '한국어',
        ja: '日本語',
        zh: '中文',
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch',
        pt: 'Português',
        ru: 'Русский',
    };

    const getLocaleLabel = (locale) => {
        return localeLabels[locale] || defaultLabels[locale] || locale;
    };

    // 로케일 변경 URL 생성
    const getLocaleUrl = (targetLocale) => {
        const pathname = location.pathname;

        // 현재 경로에서 로케일 제거
        let pathWithoutLocale = pathname;
        for (const locale of locales) {
            if (pathname.startsWith(`/${locale}/`)) {
                pathWithoutLocale = pathname.substring(locale.length + 1);
                break;
            } else if (pathname === `/${locale}`) {
                pathWithoutLocale = '/';
                break;
            }
        }

        // 기본 로케일이면 프리픽스 없음
        const defaultLocale = i18n.defaultLocale;
        if (targetLocale === defaultLocale) {
            return pathWithoutLocale;
        }

        return `/${targetLocale}${pathWithoutLocale}`;
    };

    return (
        <div className="sb-locale-dropdown" ref={dropdownRef}>
            <button
                className="sb-locale-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="언어 선택"
            >
                <svg className="sb-locale-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="sb-locale-current">{getLocaleLabel(currentLocale)}</span>
                <svg className={`sb-locale-chevron ${isOpen ? 'sb-locale-chevron-open' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <ul className="sb-locale-menu">
                    {locales.map((locale) => (
                        <li key={locale}>
                            <a
                                href={getLocaleUrl(locale)}
                                className={`sb-locale-item ${locale === currentLocale ? 'sb-locale-item-active' : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {getLocaleLabel(locale)}
                                {locale === currentLocale && (
                                    <svg className="sb-locale-check" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
