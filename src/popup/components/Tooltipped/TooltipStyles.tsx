const signingTooltipFontSize = '.8rem';

export const TooltipStyles = () => ({
  tooltip: {
    fontSize: signingTooltipFontSize,
    textAlign: 'center' as const,
    margin: '10px 0 0 0',
    maxWidth: '300px',
    width: 'fit-content'
  },
  listItemTooltip: {
    fontSize: signingTooltipFontSize,
    textAlign: 'center' as const,
    marginRight: '60px'
  },
  csprToolTip: {
    fontSize: '.9rem',
    textAlign: 'center' as const,
    margin: '10px 0 0 0',
    width: 'fit-content'
  }
});
