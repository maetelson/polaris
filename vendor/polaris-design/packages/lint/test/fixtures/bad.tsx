// Intentional violations for E2E lint test
const RED = '#FF0000';
const PRIMARY = 'rgb(45, 90, 200)';

const styles = {
  color: '#1D4ED8',
  backgroundColor: 'hsl(220, 50%, 50%)',
  fontFamily: 'Helvetica, sans-serif',
};

export function BadButton() {
  return (
    <button
      className="bg-[#1D4ED8] p-[13px] text-[24px] rounded-[14px] font-['Inter']"
      style={styles}
    >
      Click
    </button>
  );
}

const css = `
  font-family: Pretendard, sans-serif;
  color: #2B7FFF;
`;
