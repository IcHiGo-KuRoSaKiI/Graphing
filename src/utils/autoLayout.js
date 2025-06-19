export const autoLayoutNodes = (nodes) => {
  const updated = [...nodes];

  const estimateTextSize = (text, minW = 100, minH = 60, maxW = 250, maxH = 250) => {
    if (!text) return { width: minW, height: minH };
    const lines = text.split(/\n+/);
    const maxLine = Math.max(...lines.map(l => l.length));
    let width = maxLine * 7 + 20;
    let height = lines.length * 18 + 20;

    width = Math.max(minW, Math.min(maxW, width));
    height = Math.max(minH, Math.min(maxH, height));

    const ratio = width / height;
    if (ratio > 1.2) {
      height = width / 1.2;
    } else if (ratio < 0.83) {
      width = height / 0.83;
    }

    width = Math.min(maxW, width);
    height = Math.min(maxH, height);

    return { width, height };
  };

  const layoutContainer = (container, baseZ = 1) => {
    const padding = 30;
    const children = updated.filter(n => n.parentNode === container.id);
    const text = `${container.data?.label || ''} ${container.data?.description || ''}`.trim();
    const textSize = estimateTextSize(text, 150, 120);
    const headerHeight = textSize.height;
    let neededWidth = textSize.width;
    let neededHeight = headerHeight;

    if (children.length > 0) {
      children.forEach(child => {
        if (child.type === 'container') {
          layoutContainer(child, baseZ + 1);
        }
        const childText = `${child.data?.label || ''} ${child.data?.description || ''}`.trim();
        const cSize = estimateTextSize(childText);
        child.style.width = Math.max(100, cSize.width);
        child.style.height = Math.max(60, cSize.height);
        const childZ = baseZ + 1;
        child.zIndex = childZ;
        child.style = { ...child.style, zIndex: childZ };
      });

      const maxChildW = Math.max(...children.map(c => c.style?.width || 100));
      const maxChildH = Math.max(...children.map(c => c.style?.height || 60));
      const cols = Math.ceil(Math.sqrt(children.length));
      const rows = Math.ceil(children.length / cols);

      children.forEach((child, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        child.position = {
          x: padding / 2 + col * (maxChildW + padding),
          y: headerHeight + padding / 2 + row * (maxChildH + padding),
        };
        // position already set above
      });

      neededWidth = Math.max(neededWidth, padding + cols * (maxChildW + padding) - padding);
      neededHeight = Math.max(neededHeight, headerHeight + padding + rows * (maxChildH + padding) - padding);
    }

    container.zIndex = baseZ;
    container.style = {
      ...container.style,
      width: Math.max(150, neededWidth),
      height: Math.max(120, neededHeight),
      zIndex: baseZ,
    };
  };

  const topContainers = updated.filter(n => n.type === 'container' && !n.parentNode);
  topContainers.forEach(c => layoutContainer(c, 1));

  const center = { x: 400, y: 300 };
  const maxSize = Math.max(...topContainers.map(c => Math.max(c.style?.width || 150, c.style?.height || 120)), 150);
  const radius = Math.max(150, maxSize * topContainers.length / Math.PI);
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
