/**
 * 表格「按内容自动标红」
 *
 * 用法：给要生效的表格容器加一个属性，例如
 *   <div className="done-table-wrap" data-warn="晕">
 * 本模块会扫描该容器内所有单元格，文本里包含「晕」的格子自动加上
 * class="warn-cell"，颜色由页面自己的 CSS 决定（本项目写在 MDX 的 <style> 里）。
 *
 * 为什么不用内联 <script>：Docusaurus 的正文是 React 渲染的，
 * React 创建出来的 <script> 标签不会执行（MDXComponents 也没有对 script 做特殊处理），
 * 所以 dev 模式下脚本根本不跑。改用 clientModule 才能保证在静态构建和 dev 下都生效。
 *
 * 为什么不写成 span 标签：格子里直接写「晕」，维护成本最低。
 */

const WARN_CLASS = 'warn-cell';

/** 给所有带 data-warn 的容器做标记（幂等，可重复调用） */
function markWarnCells(): void {
  const containers = document.querySelectorAll<HTMLElement>('[data-warn]');
  for (const container of containers) {
    const keyword = container.getAttribute('data-warn') ?? '';
    for (const cell of container.querySelectorAll<HTMLTableCellElement>('td')) {
      const text = cell.textContent ?? '';
      cell.classList.toggle(WARN_CLASS, keyword !== '' && text.includes(keyword));
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markWarnCells);
  } else {
    markWarnCells();
  }

  // dev 模式下正文是客户端渲染的，DOMContentLoaded 时表格可能还不存在；
  // 用 MutationObserver 兜底（toggle 幂等，重复触发无副作用）。
  new MutationObserver(markWarnCells).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
