'use client';

interface Props {
  left: string;
  middle?: string;
  right?: string;
  date: string;
}

const cellStyle: React.CSSProperties = {
  minWidth: 0,
  fontWeight: 600,
  lineHeight: 1.4,
  overflowWrap: 'break-word',
};

const dateStyle: React.CSSProperties = {
  ...cellStyle,
  whiteSpace: 'nowrap',
  textAlign: 'right',
};

export default function ExperienceHeader({ left, middle, right, date }: Props) {
  return (
    <>
      <div style={{ ...cellStyle }}>{left}</div>
      <div style={{ ...cellStyle, textAlign: 'center' }}>{middle || ''}</div>
      <div style={{ ...cellStyle, textAlign: 'center' }}>{right || ''}</div>
      <div style={{ ...dateStyle }}>{date}</div>
    </>
  );
}
