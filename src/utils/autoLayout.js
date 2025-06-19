export const autoLayoutNodes = (nodes) => {
  const updated = [...nodes];

  const estimateTextSize = (text, minW = 100, minH = 60) => {
    if (!text) return { width: minW, height: minH };
    const lines = text.split(/\n+/);
    const maxLine = Math.max(...lines.map(l => l.length));
    let width = maxLine * 8 + 40;
    let height = lines.length * 20 + 40;
    width = Math.max(minW, width);
    height = Math.max(minH, height);
    const ratio = width / height;
    if (ratio > 1.5) width = height * 1.5;
    if (ratio < 0.67) height = width * 1.5;
    return { width, height };
  };

  const layoutContainer = (container, baseZ = 1) => {
    const padding = 40;
    const children = updated.filter(n => n.parentNode === container.id);
    const text = `${container.data?.label || ''} ${container.data?.description || ''}`.trim();
    const textSize = estimateTextSize(text, container.style?.width || 400, container.style?.height || 300);
    const headerHeight = textSize.height;
    let neededWidth = textSize.width;
    let neededHeight = headerHeight;

    if (children.length > 0) {
      children.forEach(child => {
        if (child.type === 'container') {
          layoutContainer(child, baseZ + 1);
        } else {
          const childText = `${child.data?.label || ''} ${child.data?.description || ''}`.trim();
          const cSize = estimateTextSize(childText, child.style?.width || 150, child.style?.height || 80);
          child.style.width = Math.max(child.style?.width || 150, cSize.width);
          child.style.height = Math.max(child.style?.height || 80, cSize.height);
        }
      });

      const maxChildW = Math.max(...children.map(c => c.style?.width || 150));
      const maxChildH = Math.max(...children.map(c => c.style?.height || 80));
      const cols = Math.ceil(Math.sqrt(children.length));
      const rows = Math.ceil(children.length / cols);

      children.forEach((child, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        child.position = {
          x: padding / 2 + col * (maxChildW + padding),
          y: headerHeight + padding / 2 + row * (maxChildH + padding),
        };
        const childZ = baseZ + 1;
        child.zIndex = childZ;
        child.style = { ...child.style, zIndex: childZ };
      });

      neededWidth = Math.max(neededWidth, padding + cols * (maxChildW + padding));
      neededHeight = Math.max(neededHeight, headerHeight + padding + rows * (maxChildH + padding));
    }

    container.zIndex = baseZ;
    container.style = {
      ...container.style,
      width: Math.max(container.style?.width || 400, neededWidth),
      height: Math.max(container.style?.height || 300, neededHeight),
      zIndex: baseZ,
    };
  };

  const topContainers = updated.filter(n => n.type === 'container' && !n.parentNode);
  topContainers.forEach(c => layoutContainer(c, 1));

  const center = { x: 400, y: 300 };
  const maxSize = Math.max(...topContainers.map(c => Math.max(c.style?.width || 400, c.style?.height || 300)), 400);
  const radius = Math.max(200, topContainers.length * (maxSize + 100) / (2 * Math.PI));
  const angleStep = (2 * Math.PI) / Math.max(1, topContainers.length);

  topContainers.forEach((container, idx) => {
    const angle = idx * angleStep;
    container.position = {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });

  return updated;
};
