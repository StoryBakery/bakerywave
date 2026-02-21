import React, { useState, useRef, useEffect } from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import './styles.css';

function ensureLeadingSlash(value) {
    if (!value) {
        return '/';
    }
    return value.startsWith('/') ? value : `/${value}`;
}

function ensureTrailingSlash(value) {
    const normalized = ensureLeadingSlash(value);
    return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripLocaleNoise(pathname, localeBasePaths, locales) {
    let result = ensureLeadingSlash(pathname || '/');
    const nonRootBases = localeBasePaths
        .filter((base) => typeof base === 'string' && base.length > 0 && base !== '/')
        .sort((left, right) => right.length - left.length);

    let changed = true;
    while (changed) {
        changed = false;
        for (const basePath of nonRootBases) {
            if (result.startsWith(basePath)) {
                const tail = result.slice(basePath.length).replace(/^\/+/, '');
                result = tail.length > 0 ? `/${tail}` : '/';
                changed = true;
                break;
            }
        }
    }

    if (Array.isArray(locales) && locales.length > 0) {
        const localePattern = new RegExp(
            `^/(?:${locales.map((locale) => escapeRegExp(locale)).join('|')})(?=/|$)`
        );
        while (localePattern.test(result)) {
            result = result.replace(localePattern, '');
            result = result.length > 0 ? ensureLeadingSlash(result) : '/';
        }
    }

    return result;
}

function getBrowserLocationFallback(location) {
    if (typeof window !== 'undefined' && window.location) {
        return {
            pathname: window.location.pathname || location.pathname || '/',
            search: window.location.search || location.search || '',
            hash: window.location.hash || location.hash || '',
        };
    }

    return {
        pathname: location.pathname || '/',
        search: location.search || '',
        hash: location.hash || '',
    };
}

export default function LocaleDropdown() {
    const { bakerywave } = useThemeConfig();
    const { i18n, siteConfig } = useDocusaurusContext();
    const location = useLocation();
    const config = bakerywave || {};
    const localeConfig = config.locale || {};
    const navbarConfig = config.navbar || {};

    // Locale Dropdown이 비활성화되면 렌더링하지 않음
    if (localeConfig.enabled !== true || navbarConfig.showLocaleDropdown !== true) {
        return null;
    }

    const { currentLocale, locales, localeConfigs } = i18n;

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
        const configured = localeConfigs && localeConfigs[locale];
        return localeLabels[locale] || (configured && configured.label) || defaultLabels[locale] || locale;
    };

    // 로케일 변경 URL 생성
    const getLocaleUrl = (targetLocale) => {
        const targetConfig = localeConfigs && localeConfigs[targetLocale];
        if (!targetConfig) {
            return location.pathname;
        }

        const browserLocation = getBrowserLocationFallback(location);
        const localeBasePaths = Object.values(localeConfigs || {})
            .map((item) => item && item.baseUrl)
            .filter(Boolean);
        const normalizedSuffix = stripLocaleNoise(browserLocation.pathname, localeBasePaths, locales);
        const suffixWithoutSlash = normalizedSuffix === '/' ? '' : normalizedSuffix.replace(/^\/+/, '');
        const targetBasePath = ensureTrailingSlash(targetConfig.baseUrl || '/');
        const targetPathRaw = suffixWithoutSlash.length > 0
            ? `${targetBasePath}${suffixWithoutSlash}`
            : targetBasePath;
        const targetPath = targetPathRaw.replace(/\/{2,}/g, '/');

        const fullyQualified = targetConfig.url && targetConfig.url !== siteConfig.url;
        if (fullyQualified) {
            return `${targetConfig.url.replace(/\/+$/, '')}${targetPath}${browserLocation.search}${browserLocation.hash}`;
        }

        return `${targetPath}${browserLocation.search}${browserLocation.hash}`;
    };

    return (
        <div className="sb-locale-dropdown" ref={dropdownRef}>
            <button
                className="sb-locale-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Select language"
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
