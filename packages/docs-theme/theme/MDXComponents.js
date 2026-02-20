import React from 'react';
import Head from '@docusaurus/Head';
import MDXCode from '@theme/MDXComponents/Code';
import MDXA from '@theme/MDXComponents/A';
import MDXPre from '@theme/MDXComponents/Pre';
import MDXDetails from '@theme/MDXComponents/Details';
import MDXHeading from '@theme/MDXComponents/Heading';
import MDXUl from '@theme/MDXComponents/Ul';
import MDXLi from '@theme/MDXComponents/Li';
import MDXImg from '@theme/MDXComponents/Img';
import Mermaid from '@theme/Mermaid';
import DefaultTabsComponent from '@theme/Tabs';
import DefaultTabItemComponent from '@theme/TabItem';

function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function spanToWidth(value) {
    const span = toNumber(value);
    if (span === null || span <= 0) {
        return null;
    }

    const clamped = Math.min(span, 12);
    return `${(clamped / 12) * 100}%`;
}

function spacingToGap(value) {
    const amount = toNumber(value);
    if (amount === null || amount < 0) {
        return null;
    }

    return `${amount * 8}px`;
}

function normalizeAlertSeverity(value) {
    const severity = typeof value === 'string' ? value.toLowerCase() : '';
    if (severity === 'warning' || severity === 'error' || severity === 'success') {
        return severity;
    }
    return 'info';
}

function normalizeAlertVariant(value) {
    return value === 'outlined' ? 'outlined' : 'standard';
}

function Alert({ children, severity, variant, className, style, ...rest }) {
    const normalizedSeverity = normalizeAlertSeverity(severity);
    const normalizedVariant = normalizeAlertVariant(variant);
    const icons = {
        info: 'i',
        warning: '!',
        error: 'x',
        success: 'v',
    };

    return (
        <div
            className={classNames(
                'sb-alert',
                `sb-alert--${normalizedSeverity}`,
                `sb-alert--${normalizedVariant}`,
                className
            )}
            style={style}
            role="alert"
            {...rest}
        >
            <span className="sb-alert__icon" aria-hidden="true">
                {icons[normalizedSeverity]}
            </span>
            <div className="sb-alert__body">{children}</div>
        </div>
    );
}

function AlertTitle({ children, className, ...rest }) {
    return (
        <div className={classNames('sb-alert__title', className)} {...rest}>
            {children}
        </div>
    );
}

function BaseAccordion({ children, defaultExpanded, open, className, ...rest }) {
    const resolvedOpen = open ?? (defaultExpanded === true || defaultExpanded === 'true');

    return (
        <details className={classNames('sb-accordion', className)} open={resolvedOpen} {...rest}>
            {children}
        </details>
    );
}

function AccordionSummary({ children, className, ...rest }) {
    return (
        <summary className={classNames('sb-accordion__summary', className)} {...rest}>
            {children}
        </summary>
    );
}

function AccordionDetails({ children, className, ...rest }) {
    return (
        <div className={classNames('sb-accordion__details', className)} {...rest}>
            {children}
        </div>
    );
}

function GridContainer({ children, numColumns = 2, className, style, ...rest }) {
    const parsedColumns = toNumber(numColumns);
    const columns = parsedColumns && parsedColumns > 0 ? Math.round(parsedColumns) : 2;

    return (
        <div
            className={classNames('sb-grid-container', className)}
            style={{
                ...style,
                '--sb-grid-columns': columns,
            }}
            {...rest}
        >
            {children}
        </div>
    );
}

function Grid({
    children,
    container,
    item,
    spacing,
    alignItems,
    direction,
    wrap,
    xs,
    XSmall,
    Medium,
    Large,
    XLarge,
    className,
    style,
    ...rest
}) {
    const isContainer = Boolean(container);
    const isItem = Boolean(item);
    const nextStyle = { ...(style || {}) };

    if (isContainer) {
        const gap = spacingToGap(spacing);
        if (gap) {
            nextStyle.gap = gap;
        }
        if (alignItems) {
            nextStyle.alignItems = alignItems;
        }
        if (direction) {
            nextStyle.flexDirection = direction;
        }
        if (wrap) {
            nextStyle.flexWrap = wrap;
        }
    }

    if (isItem) {
        const xsWidth = spanToWidth(xs ?? XSmall);
        const mdWidth = spanToWidth(Medium);
        const lgWidth = spanToWidth(Large);
        const xlWidth = spanToWidth(XLarge);

        if (xsWidth) {
            nextStyle['--sb-grid-xs'] = xsWidth;
        }
        if (mdWidth) {
            nextStyle['--sb-grid-md'] = mdWidth;
        }
        if (lgWidth) {
            nextStyle['--sb-grid-lg'] = lgWidth;
        }
        if (xlWidth) {
            nextStyle['--sb-grid-xl'] = xlWidth;
        }
    }

    return (
        <div
            className={classNames(
                'sb-grid',
                isContainer && 'sb-grid--container',
                isItem && 'sb-grid--item',
                className
            )}
            style={nextStyle}
            {...rest}
        >
            {children}
        </div>
    );
}

const TYPOGRAPHY_TAGS = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'p',
    subtitle2: 'p',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span',
};

function Typography({
    children,
    variant = 'body1',
    component,
    noWrap,
    className,
    style,
    ...rest
}) {
    const Tag = component || TYPOGRAPHY_TAGS[variant] || 'p';

    return (
        <Tag
            className={classNames(
                'sb-typography',
                variant && `sb-typography--${variant}`,
                noWrap && 'sb-typography--no-wrap',
                className
            )}
            style={style}
            {...rest}
        >
            {children}
        </Tag>
    );
}

function normalizeButtonVariant(value) {
    if (value === 'outlined' || value === 'text' || value === 'link') {
        return value;
    }
    return 'contained';
}

function normalizeButtonSize(value) {
    if (value === 'small' || value === 'large') {
        return value;
    }
    return 'medium';
}

function normalizeButtonColor(value) {
    if (typeof value !== 'string' || value.length === 0) {
        return 'primary';
    }
    return value.toLowerCase();
}

function Button({
    children,
    href,
    target,
    rel,
    variant = 'contained',
    size = 'medium',
    color = 'primary',
    className,
    style,
    ...rest
}) {
    const normalizedVariant = normalizeButtonVariant(variant);
    const normalizedSize = normalizeButtonSize(size);
    const normalizedColor = normalizeButtonColor(color);
    const classes = classNames(
        'sb-button',
        `sb-button--${normalizedVariant}`,
        `sb-button--${normalizedSize}`,
        `sb-button--${normalizedColor}`,
        className
    );

    if (href) {
        const linkRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);
        return (
            <a href={href} target={target} rel={linkRel} className={classes} style={style} {...rest}>
                {children}
            </a>
        );
    }

    return (
        <button type="button" className={classes} style={style} {...rest}>
            {children}
        </button>
    );
}

function Card({ children, className, style, ...rest }) {
    return (
        <div className={classNames('sb-card', className)} style={style} {...rest}>
            {children}
        </div>
    );
}

function CardContent({ children, className, style, ...rest }) {
    return (
        <div className={classNames('sb-card__content', className)} style={style} {...rest}>
            {children}
        </div>
    );
}

function CardActions({ children, className, style, ...rest }) {
    return (
        <div className={classNames('sb-card__actions', className)} style={style} {...rest}>
            {children}
        </div>
    );
}

function Chip({
    children,
    label,
    size = 'medium',
    variant = 'filled',
    color = 'default',
    className,
    style,
    ...rest
}) {
    const normalizedSize = size === 'small' ? 'small' : 'medium';
    const normalizedVariant = variant === 'outlined' ? 'outlined' : 'filled';
    const normalizedColor = typeof color === 'string' && color.length > 0 ? color.toLowerCase() : 'default';
    const content = label || children;

    return (
        <span
            className={classNames(
                'sb-chip',
                `sb-chip--${normalizedSize}`,
                `sb-chip--${normalizedVariant}`,
                `sb-chip--${normalizedColor}`,
                className
            )}
            style={style}
            {...rest}
        >
            {content}
        </span>
    );
}

function KeyboardInput({ children, className, style, ...rest }) {
    return (
        <kbd className={classNames('sb-kbd', className)} style={style} {...rest}>
            {children}
        </kbd>
    );
}

function BetaAlert({
    betaName = 'This feature',
    leadIn = 'This feature is currently in beta. Enable it through ',
    leadOut = '.',
    className,
    ...rest
}) {
    return (
        <Alert severity="info" className={classNames('sb-beta-alert', className)} {...rest}>
            <AlertTitle>{betaName} (Beta)</AlertTitle>
            {leadIn}
            <code>File &gt; Beta Features</code>
            {leadOut}
        </Alert>
    );
}

function UseStudioButton({
    buttonTextTranslationKey,
    buttonText,
    placeId,
    universeId,
    variant = 'contained',
    className,
    ...rest
}) {
    const textByKey = {
        'Action.EditInStudio': 'Edit in Studio',
    };
    const label = buttonText || textByKey[buttonTextTranslationKey] || 'Open in Studio';

    let href = '#';
    if (universeId) {
        href = `https://create.roblox.com/dashboard/creations/experiences/${universeId}/overview`;
    } else if (placeId) {
        href = `https://www.roblox.com/games/${placeId}`;
    }

    return (
        <Button
            href={href}
            target="_blank"
            variant={variant === 'link' ? 'text' : variant}
            className={classNames('sb-use-studio-button', className)}
            {...rest}
        >
            {label}
        </Button>
    );
}

function TabItem({ value, label, children, ...rest }) {
    const resolvedValue = value || label || 'tab';
    const resolvedLabel = label || resolvedValue;

    return (
        <DefaultTabItemComponent value={resolvedValue} label={resolvedLabel} {...rest}>
            {children}
        </DefaultTabItemComponent>
    );
}

function Tabs({ children, ...rest }) {
    const normalizedChildren = React.Children.toArray(children).map((child, index) => {
        if (!React.isValidElement(child)) {
            return child;
        }

        const childProps = child.props || {};
        const value = childProps.value || childProps.label || `tab-${index + 1}`;
        if (childProps.value) {
            return child;
        }

        return React.cloneElement(child, { value });
    });

    return <DefaultTabsComponent {...rest}>{normalizedChildren}</DefaultTabsComponent>;
}

const baseComponents = {
    Head,
    details: MDXDetails,
    Details: MDXDetails,
    code: MDXCode,
    a: MDXA,
    pre: MDXPre,
    ul: MDXUl,
    li: MDXLi,
    img: MDXImg,
    h1: (props) => <MDXHeading as="h1" {...props} />,
    h2: (props) => <MDXHeading as="h2" {...props} />,
    h3: (props) => <MDXHeading as="h3" {...props} />,
    h4: (props) => <MDXHeading as="h4" {...props} />,
    h5: (props) => <MDXHeading as="h5" {...props} />,
    h6: (props) => <MDXHeading as="h6" {...props} />,
    mermaid: Mermaid,
};

export default {
    ...baseComponents,
    Alert,
    AlertTitle,
    BaseAccordion,
    AccordionSummary,
    AccordionDetails,
    GridContainer,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    KeyboardInput,
    BetaAlert,
    UseStudioButton,
    Tabs,
    TabItem,
};
