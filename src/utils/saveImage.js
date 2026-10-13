// 요소를 PNG 이미지로 저장해요. html2canvas는 저장할 때만 불러와요.
export async function saveElementAsImage(element, title) {
  const { default: html2canvas } = await import('html2canvas');

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    // 선택 표시는 이미지에 넣지 않아요 (미리보기 블록은 data-html2canvas-ignore로 제외)
    onclone: (doc) => {
      doc
        .querySelectorAll('.block.selected')
        .forEach((b) => b.classList.remove('selected'));
    },
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('이미지를 만들지 못했어요.');

  const name = (title || '시간표').replace(/[\\/:*?"<>|]/g, '').trim() || '시간표';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
