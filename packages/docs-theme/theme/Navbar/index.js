import React from 'react';
import clsx from 'clsx';
import {
    ErrorCauseBoundary,
    ThemeClassNames,
    useThemeConfig,
} from '@docusaurus/theme-common';
import NavbarLayout from '@theme/Navbar/Layout';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarSearch from '@theme/Navbar/Search';
import SearchBar from '../SearchBar';
import LocaleDropdown from '../LocaleDropdown';

function splitNavbarItems(items) {
    function isLeft(item) {
        return (item?.position || 'right') === 'left';
    }
    const leftItems = items.filter(isLeft);
    const rightItems = items.filter((item) => !isLeft(item));
    return [leftItems, rightItems];
}

function NavbarItems({ items }) {
    return (
        <>
            {items.map((item, i) => (
                <ErrorCauseBoundary
                    key={i}
                    onError={(error) =>
                        new Error(
                            `A theme navbar item failed to render.\n${JSON.stringify(item, null, 2)}`,
                            { cause: error }
                        )
                    }>
                    <NavbarItem {...item} />
                </ErrorCauseBoundary>
            ))}
        </>
    );
}

export default function Navbar() {
    const themeConfig = useThemeConfig();
    const items = Array.isArray(themeConfig?.navbar?.items) ? themeConfig.navbar.items : [];
    const [leftItems, rightItems] = splitNavbarItems(items);
    const searchBarItem = items.find((item) => item?.type === 'search');

    return (
        <NavbarLayout>
            <div className="navbar__inner">
                <div className={clsx(ThemeClassNames.layout.navbar.containerLeft, 'navbar__items')}>
                    <NavbarMobileSidebarToggle />
                    <NavbarLogo />
                    <NavbarItems items={leftItems} />
                </div>
                <div className={clsx(ThemeClassNames.layout.navbar.containerRight, 'navbar__items navbar__items--right')}>
                    <NavbarItems items={rightItems} />
                    <NavbarColorModeToggle />
                    {!searchBarItem && (
                        <NavbarSearch>
                            <SearchBar />
                        </NavbarSearch>
                    )}
                    <LocaleDropdown />
                </div>
            </div>
        </NavbarLayout>
    );
}
