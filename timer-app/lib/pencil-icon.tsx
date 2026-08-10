export function PencilIcon({ size }: { size: number }) {
  const thickness = size * 0.16;
  const tipHeight = size * 0.11;
  const ferruleHeight = size * 0.035;
  const bodyHeight = size * 0.46;
  const eraserHeight = size * 0.09;
  const pencilHeight = tipHeight + ferruleHeight + bodyHeight + eraserHeight;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1e293b",
        borderRadius: size * 0.22,
      }}
    >
      <div
        style={{
          width: thickness,
          height: pencilHeight,
          display: "flex",
          flexDirection: "column",
          transform: "rotate(-45deg)",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${thickness / 2}px solid transparent`,
            borderRight: `${thickness / 2}px solid transparent`,
            borderBottom: `${tipHeight}px solid #4b5563`,
          }}
        />
        <div
          style={{ width: thickness, height: ferruleHeight, background: "#e5e7eb" }}
        />
        <div style={{ width: thickness, height: bodyHeight, background: "#fbbf24" }} />
        <div
          style={{
            width: thickness,
            height: eraserHeight,
            background: "#f472b6",
            borderBottomLeftRadius: thickness * 0.4,
            borderBottomRightRadius: thickness * 0.4,
          }}
        />
      </div>
    </div>
  );
}
