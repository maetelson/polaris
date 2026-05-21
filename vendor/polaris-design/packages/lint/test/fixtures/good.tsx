// Should produce ZERO lint errors — uses Polaris v0.7 spec tokens.
// (Updated from v0.6 alias names in v0.7.5 when no-deprecated-polaris-token
//  rule landed — the old fixture used `--polaris-brand-primary`,
//  `--polaris-surface-canvas`, `bg-brand-primary`, `text-fg-on-brand`,
//  `--polaris-text-primary` which are all deprecated.)
const styles = {
  color: 'var(--polaris-accent-brand-normal)',
  backgroundColor: 'var(--polaris-background-base)',
  fontFamily: 'var(--polaris-font-sans)',
};

export function GoodCard() {
  return (
    <div
      className="bg-accent-brand-normal text-label-inverse p-4 rounded-polaris-md font-polaris"
      style={styles}
    >
      Click
    </div>
  );
}

const css = `
  font-family: var(--polaris-font-sans);
  color: var(--polaris-label-normal);
`;
