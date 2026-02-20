import React from 'react';
import NavbarLayout from '@theme/Navbar/Layout';
import NavbarContent from '@theme/Navbar/Content';
import SearchBar from '../SearchBar';
import LocaleDropdown from '../LocaleDropdown';
import { useThemeConfig } from '@docusaurus/theme-common';
import './styles.css';

export default function Navbar() {
    const { bakerywave } = useThemeConfig();
    const config = bakerywave || {};
    const navbarConfig = config.navbar || {};

    const showSearch = navbarConfig.showSearch === true;
    const showLocaleDropdown = navbarConfig.showLocaleDropdown === true;

    return (
        <NavbarLayout>
            <NavbarContent />
            <div className="sb-navbar-extras">
                {showSearch && <SearchBar />}
                {showLocaleDropdown && <LocaleDropdown />}
            </div>
        </NavbarLayout>
    );
}
