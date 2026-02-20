import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useHistory } from '@docusaurus/router';
import { useThemeConfig } from '@docusaurus/theme-common';
import './styles.css';

// 타입별 라벨 및 아이콘
const TYPE_CONFIG = {
    class: { label: 'Class', icon: '📦', color: '#00a2ff' },
    function: { label: 'Function', icon: '⚡', color: '#9f70ea' },
    api: { label: 'API', icon: '🔧', color: '#f2994a' },
    doc: { label: 'Doc', icon: '📄', color: '#6b7280' },
};

const SECTION_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

function toSectionLabel(section) {
    if (!section) {
        return 'Unknown';
    }
    return section
        .split(/[-_]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function getSectionColor(section) {
    if (!section) {
        return SECTION_COLORS[0];
    }
    let hash = 0;
    for (let index = 0; index < section.length; index += 1) {
        hash = (hash << 5) - hash + section.charCodeAt(index);
        hash |= 0;
    }
    return SECTION_COLORS[Math.abs(hash) % SECTION_COLORS.length];
}

export default function SearchBar() {
    const { bakerywave } = useThemeConfig();
    const config = bakerywave || {};
    const searchConfig = config.search || {};
    const navbarConfig = config.navbar || {};

    // 검색이 비활성화되면 렌더링하지 않음
    if (searchConfig.enabled !== true || navbarConfig.showSearch !== true) {
        return null;
    }

    // 설정 값들
    const placeholder = searchConfig.placeholder || 'Search...';
    const shortcut = searchConfig.shortcut || 'Ctrl K';
    const minChars = searchConfig.minChars || 2;
    const hints = searchConfig.hints || {};
    const filters = searchConfig.filters || {};

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [index, setIndex] = useState(null);
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [sectionFilter, setSectionFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const inputRef = useRef(null);
    const modalRef = useRef(null);
    const history = useHistory();

    // 검색 인덱스 로드
    useEffect(() => {
        fetch('/search-index.json')
            .then(res => res.json())
            .then(data => setIndex(data))
            .catch(err => console.warn('Failed to load search index:', err));
    }, []);

    // 키보드 단축키 (Ctrl+K 또는 /)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            } else if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                setIsOpen(true);
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // 모달 열릴 때 포커스
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // 검색 로직
    const performSearch = useCallback((searchQuery) => {
        if (!index || searchQuery.trim().length < minChars) {
            setResults([]);
            return;
        }

        const normalizedQuery = searchQuery.toLowerCase().trim();
        const queryWords = normalizedQuery.split(/\s+/);

        const entries = index.entries || [];
        let filtered = entries.filter(entry => {
            if (!entry) return false;
            // 섹션 필터
            if (sectionFilter !== 'all' && entry.section !== sectionFilter) {
                return false;
            }
            // 카테고리 필터
            if (categoryFilter !== 'all' && entry.category !== categoryFilter) {
                return false;
            }

            // 검색어 매칭
            const entryTitle = entry.title || '';
            const entryContent = entry.content || '';
            const searchText = `${entryTitle} ${entryContent}`.toLowerCase();
            return queryWords.every(word => searchText.includes(word));
        });

        // 관련성 순으로 정렬
        filtered.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();

            // 제목에서 정확히 일치하는 경우 우선
            const aExact = aTitle === normalizedQuery;
            const bExact = bTitle === normalizedQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            // 제목이 쿼리로 시작하는 경우
            const aStarts = aTitle.startsWith(normalizedQuery);
            const bStarts = bTitle.startsWith(normalizedQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            // 제목에 쿼리가 포함된 경우
            const aInTitle = aTitle.includes(normalizedQuery);
            const bInTitle = bTitle.includes(normalizedQuery);
            if (aInTitle && !bInTitle) return -1;
            if (!aInTitle && bInTitle) return 1;

            // 알파벳 순
            return aTitle.localeCompare(bTitle);
        });

        setResults(filtered.slice(0, 20));
        setSelectedIndex(0);
    }, [index, sectionFilter, categoryFilter, minChars]);

    // 검색어 변경 시
    useEffect(() => {
        performSearch(query);
    }, [query, performSearch]);

    // 결과 선택
    const handleSelect = (entry) => {
        history.push(entry.url);
        setIsOpen(false);
        setQuery('');
    };

    // 키보드 네비게이션
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const availableSections = useMemo(() => {
        if (!index) {
            return [];
        }
        const explicitSections = Array.isArray(index.sections) ? index.sections.filter(Boolean) : [];
        if (explicitSections.length > 0) {
            return [...explicitSections].sort((a, b) => a.localeCompare(b));
        }
        const derivedSections = [
            ...new Set(
                (index.entries || [])
                    .map((entry) => entry && entry.section)
                    .filter(Boolean)
            ),
        ];
        return derivedSections.sort((a, b) => a.localeCompare(b));
    }, [index]);

    const availableCategories = useMemo(() => {
        if (!index || sectionFilter === 'all') {
            return [];
        }
        const categories = [
            ...new Set(
                (index.entries || [])
                    .filter((entry) => entry && entry.section === sectionFilter && entry.category)
                    .map((entry) => entry.category)
            ),
        ];
        return categories.sort((a, b) => a.localeCompare(b));
    }, [index, sectionFilter]);

    useEffect(() => {
        setCategoryFilter('all');
    }, [sectionFilter]);

    // 필터 라벨
    const sectionLabels = filters.sections || {};
    const getSectionLabel = (section) => {
        if (sectionLabels[section]) {
            return sectionLabels[section];
        }
        if (filters[section]) {
            return filters[section];
        }
        return toSectionLabel(section);
    };
    const allLabel = filters.all || 'All';

    return (
        <>
            {/* 검색 버튼 */}
            <button
                className="sb-search-button"
                onClick={() => setIsOpen(true)}
                aria-label="Search"
            >
                <svg className="sb-search-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="sb-search-placeholder">{placeholder}</span>
                <kbd className="sb-search-kbd">{shortcut}</kbd>
            </button>

            {/* 검색 모달 */}
            {isOpen && (
                <div className="sb-search-overlay">
                    <div className="sb-search-modal" ref={modalRef}>
                        {/* 검색 입력 */}
                        <div className="sb-search-input-wrapper">
                            <svg className="sb-search-input-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                className="sb-search-input"
                                placeholder={placeholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="sb-search-close" onClick={() => setIsOpen(false)}>
                                ESC
                            </button>
                        </div>

                        {/* 필터 */}
                        <div className="sb-search-filters">
                            <div className="sb-search-filter-group">
                                <label className="sb-search-filter-label">Section</label>
                                <select
                                    className="sb-search-filter-select"
                                    value={sectionFilter}
                                    onChange={(e) => setSectionFilter(e.target.value)}
                                >
                                    <option value="all">{allLabel}</option>
                                    {availableSections.map((section) => (
                                        <option key={section} value={section}>
                                            {getSectionLabel(section)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {sectionFilter !== 'all' && availableCategories.length > 0 && (
                                <div className="sb-search-filter-group">
                                    <label className="sb-search-filter-label">Category</label>
                                    <select
                                        className="sb-search-filter-select"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="all">{allLabel}</option>
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* 결과 */}
                        <div className="sb-search-results">
                            {query.length < minChars ? (
                                <div className="sb-search-hint">{hints.minChars || `Type at least ${minChars} characters`}</div>
                            ) : results.length === 0 ? (
                                <div className="sb-search-no-results">{hints.noResults || 'No results found'}</div>
                            ) : (
                                <ul className="sb-search-result-list">
                                    {results.map((entry, idx) => {
                                        const typeConfig = TYPE_CONFIG[entry.type] || TYPE_CONFIG.doc;
                                        const sectionColor = getSectionColor(entry.section);
                                        const sectionLabel = getSectionLabel(entry.section);

                                        return (
                                            <li
                                                key={entry.id}
                                                className={`sb-search-result-item ${idx === selectedIndex ? 'sb-search-result-selected' : ''}`}
                                                onClick={() => handleSelect(entry)}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                            >
                                                <span className="sb-search-result-icon" style={{ color: typeConfig.color }}>
                                                    {typeConfig.icon}
                                                </span>
                                                <div className="sb-search-result-content">
                                                    <div className="sb-search-result-title">{entry.title}</div>
                                                    <div className="sb-search-result-meta">
                                                        <span
                                                            className="sb-search-result-section"
                                                            style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
                                                        >
                                                            {sectionLabel}
                                                        </span>
                                                        <span className="sb-search-result-type" style={{ color: typeConfig.color }}>
                                                            {typeConfig.label}
                                                        </span>
                                                        {entry.category && (
                                                            <span className="sb-search-result-category">{entry.category}</span>
                                                        )}
                                                    </div>
                                                    {entry.excerpt && (
                                                        <div className="sb-search-result-excerpt">{entry.excerpt.slice(0, 100)}...</div>
                                                    )}
                                                </div>
                                                <svg className="sb-search-result-arrow" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* 푸터 */}
                        <div className="sb-search-footer">
                            <span><kbd>↑↓</kbd> Navigate</span>
                            <span><kbd>Enter</kbd> Select</span>
                            <span><kbd>Esc</kbd> Close</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
