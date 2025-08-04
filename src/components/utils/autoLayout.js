export const autoLayoutNodes = (nodes) => {
  const updated = [...nodes];

  const estimateTextSize = (
    text,
    minW = 80,
    minH = 50,
    maxW = 220,
    maxH = 220
  ) => {
    if (!text) return { width: minW, height: minH };
    
    // Split text into header and description parts
    const parts = text.split(/\s+/);
    const headerWords = [];
    const descriptionWords = [];
    let isHeader = true;
    let inParentheses = false;
    
    parts.forEach(word => { 
      // Check if we're entering parentheses (technical details)
      if (word.includes('(')) {
        isHeader = false;
        inParentheses = true;
        return; // Skip adding this word to either array
      }
      
      // Check if we're exiting parentheses
      if (word.includes(')')) {
        inParentheses = false;
        return; // Skip adding this word to either array
      }
      
      // If we're inside parentheses, add to description
      if (inParentheses) {
        descriptionWords.push(word);
        return;
      }
      
      // Check if this word indicates we're moving to description (outside parentheses)
      if (word.includes('AWS') || word.includes('HTTP') || 
          word.includes('OAuth') || word.includes('RBAC') || word.includes('JWT') ||
          word.includes('Kubernetes') || word.includes('Prometheus') || word.includes('Jaeger') ||
          word.includes('Lambda') || word.includes('Kinesis') || word.includes('SQS')) {
        isHeader = false;
      }
      
      if (isHeader) {
        headerWords.push(word);
      } else {
        descriptionWords.push(word);
      }
    });
    
    const headerText = headerWords.join(' ');
    const descriptionText = descriptionWords.join(' ');
    
    // Calculate header size (including badges)
    const headerCharWidth = 9; // Slightly larger for bold header text
    const headerLineHeight = 28; // Increased from 24 to 28 for better spacing
    const headerPadding = 32;
    
    // Count badges/technical terms in header
    const badgeTerms = ['HTTP', 'OAuth', 'RBAC', 'JWT', 'AWS', 'Lambda', 'Kinesis', 'SQS', 'Kubernetes', 'Prometheus', 'Jaeger'];
    const headerBadges = badgeTerms.filter(term => headerText.includes(term)).length;
    const badgeWidth = 50; // Width per badge
    const badgeHeight = 20; // Height for badge row
    
    // Force title to get 70% of width, badges get 30%
    const titleAreaWidth = Math.floor(maxW * 0.7); // Title gets 70% of total width
    const badgeAreaWidth = headerBadges > 0 ? Math.floor(maxW * 0.25) : 0; // Badges get 25% max
    
    // Calculate title layout with generous space
    const titleMaxCharsPerLine = Math.max(30, Math.floor(titleAreaWidth / headerCharWidth));
    const titleLines = Math.ceil(headerText.length / titleMaxCharsPerLine) || 1;
    const titleAreaHeight = titleLines * headerLineHeight;
    
    // Calculate badge layout - force into smaller area
    const badgesPerRow = headerBadges > 0 ? Math.max(2, Math.floor(badgeAreaWidth / 40)) : 0; // Force 2+ badges per row
    const badgeRows = headerBadges > 0 ? Math.ceil(headerBadges / badgesPerRow) : 0;
    const badgeAreaHeight = badgeRows * (badgeHeight + 3); // Compact vertical spacing
    
    // Header width calculation - use full available width with fixed ratio
    let headerWidth = Math.max(
      titleAreaWidth + badgeAreaWidth + headerPadding, // Total space for both areas
      minW
    );
    headerWidth = Math.min(headerWidth, maxW);
    
    // Header height is the maximum of title height and badge height
    const headerMultilineHeight = Math.max(titleAreaHeight, badgeAreaHeight) + 8; // Extra padding
    
    // Calculate description size with word wrapping
    const descWords = descriptionText.split(/\s+/);
    const descLines = [];
    let currentLine = '';
    const maxDescCharsPerLine = Math.floor((maxW - 40) / 8); // Account for padding
    
    descWords.forEach(word => {
      if ((currentLine + word).length <= maxDescCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          descLines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, break it
          descLines.push(word.substring(0, maxDescCharsPerLine));
          currentLine = word.substring(maxDescCharsPerLine);
        }
      }
    });
    if (currentLine) descLines.push(currentLine);
    
    // Calculate description dimensions
    const descCharWidth = 8;
    const descLineHeight = 18;
    const descPadding = 24;
    
    const maxDescLineLength = Math.max(...descLines.map(line => line.length));
    let descWidth = Math.max(maxDescLineLength * descCharWidth + descPadding, minW);
    let descHeight = Math.max(descLines.length * descLineHeight + descPadding, minH);
    
    // Combine header and description dimensions
    let totalWidth = Math.max(headerWidth, descWidth);
    let totalHeight = headerMultilineHeight + descHeight + 16; // Added extra spacing between header and description
    
    // Add extra space for technical details
    const hasTechnicalDetails = text.includes('HTTP') || text.includes('OAuth') || text.includes('RBAC') || 
                              text.includes('JWT') || text.includes('Kubernetes') || text.includes('Prometheus');
    if (hasTechnicalDetails) {
      totalWidth += 40; // Extra space for technical badges
      totalHeight += 16; // Extra height for technical details
    }
    
    // Apply constraints
    totalWidth = Math.max(minW, Math.min(maxW, totalWidth));
    totalHeight = Math.max(minH, Math.min(maxH, totalHeight));
    
    // Apply flexible aspect ratio - prefer wider boxes to prevent text wrapping  
    const targetRatio = headerBadges > 2 ? 2.5/1 : 3/2; // Wider ratio for many badges
    const currentRatio = totalWidth / totalHeight;
    const minWidthForFlexLayout = Math.max(titleAreaWidth + badgeAreaWidth + headerPadding + 20, 150); // Minimum for flex layout
    
    // Prioritize preventing text wrapping over strict aspect ratio
    if (totalWidth < minWidthForFlexLayout) {
      totalWidth = minWidthForFlexLayout;
    }
    
    // Only enforce ratio if it doesn't cause excessive text wrapping
    if (totalWidth <= maxW && totalHeight <= maxH && totalWidth >= minWidthForFlexLayout) {
      if (currentRatio < targetRatio) {
        // Too tall, make wider to fit content better
        totalWidth = Math.max(totalHeight * targetRatio, minWidthForFlexLayout);
      }
    }
    
    // Ensure minimum and maximum constraints
    totalWidth = Math.max(minW, Math.min(maxW, totalWidth));
    totalHeight = Math.max(minH, Math.min(maxH, totalHeight));
    
    // If height exceeds max, recalculate width based on max height
    if (totalHeight > maxH) {
      totalHeight = maxH;
      totalWidth = totalHeight * targetRatio;
      totalWidth = Math.max(minW, Math.min(maxW, totalWidth));
    }
    
    // If width exceeds max, recalculate height based on max width
    if (totalWidth > maxW) {
      totalWidth = maxW;
      totalHeight = totalWidth / targetRatio;
      totalHeight = Math.max(minH, Math.min(maxH, totalHeight));
    }
    
    return { width: totalWidth, height: totalHeight };
  };

  const layoutContainer = (container, baseZ = 1) => {
    const padding = 30;
    const children = updated.filter(n => n.parentNode === container.id);
    const text = `${container.data?.label || ''} ${container.data?.description || ''}`.trim();
    const textSize = estimateTextSize(text, 130, 100, 350, 220); // Use same maxW as children
    const headerHeight = textSize.height;
    let neededWidth = textSize.width;
    let neededHeight = headerHeight;

    if (children.length > 0) {
      children.forEach(child => {
        if (child.type === 'container') {
          layoutContainer(child, baseZ + 1);
        }
        const childText = `${child.data?.label || ''} ${child.data?.description || ''}`.trim();
        const cSize = estimateTextSize(childText, 80, 50, 350, 220); // Increased maxW from 220 to 350
        child.style.width = Math.max(120, cSize.width); // Increased minimum from 80 to 120
        child.style.height = Math.max(50, cSize.height);
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
      width: Math.max(180, neededWidth), // Increased minimum container width
      height: Math.max(100, neededHeight),
      zIndex: baseZ,
    };
  };

  const topContainers = updated.filter(n => n.type === 'container' && !n.parentNode);
  topContainers.forEach(c => layoutContainer(c, 1));

  const center = { x: 400, y: 300 };
  const maxSize = Math.max(...topContainers.map(c => Math.max(c.style?.width || 150, c.style?.height || 120)), 150);
  const radius = Math.max(
    120,
    (maxSize * topContainers.length) / (Math.PI * 1.5)
  );
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
