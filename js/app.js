    function renderMenu() {
      const financeItems = menuGroups.find(group => group.label === '财务管理')?.items || [];
      const systemItems = menuGroups.find(group => group.label === '系统管理')?.items || [];
      const menuHtml = menuGroups.map(group => {
        if (group.label === '财务管理') {
          return `<button class="menu-item menu-parent${financeMenuExpanded ? ' expanded' : ''}" onclick="toggleFinanceMenu()"><span class="menu-parent-main"><span class="menu-icon">${iconSvg('pay')}</span><span>财务管理</span></span><span class="menu-parent-arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></button>${financeMenuExpanded ? `<div class="menu-submenu">${financeItems.map(([id, icon, label]) => `<button class="menu-subitem${id === current ? ' active' : ''}" onclick="openFinancePage('${id}')"><span class="menu-subitem-icon">${iconSvg(icon)}</span><span>${label}</span></button>`).join('')}</div>` : ''}`;
        }
        if (group.label === '系统管理') {
          if (currentAccountType !== '超级管理员') return '';
          return `<button class="menu-item menu-parent${systemMenuExpanded ? ' expanded' : ''}" onclick="toggleSystemMenu()"><span class="menu-parent-main"><span class="menu-icon">${iconSvg('system')}</span><span>系统管理</span></span><span class="menu-parent-arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></button>${systemMenuExpanded ? `<div class="menu-submenu">${systemItems.map(([id, icon, label]) => `<button class="menu-subitem${id === current ? ' active' : ''}" onclick="openSystemPage('${id}')"><span class="menu-subitem-icon">${iconSvg(icon)}</span><span>${label}</span></button>`).join('')}</div>` : ''}`;
        }
        return group.items.map(([id, icon, label]) => `<button class="menu-item ${id === 'dashboard' ? 'overview-item' : ''} ${id === current ? 'active' : ''}" onclick="event.stopPropagation(); switchPage('${id}')"><span class="menu-icon">${iconSvg(icon)}</span><span>${label}</span></button>`).join('');
      }).join('');
      document.getElementById('menu').innerHTML = menuHtml;
      const accountDisplay = document.getElementById('currentAccountName');
      if (accountDisplay) accountDisplay.textContent = currentAccountType === '超级管理员' ? '超级管理员' : currentLoginName;
      const item = menuItems.find(i => i[0] === current);
      const garagePath = garageSubpage === 'detail' ? `项目管理 / ${selectedGarageName}详情` : garageSubpage === 'edit' ? `项目管理 / ${selectedGarageName}编辑` : garageSubpage === 'create' ? '项目管理 / 新增小区项目' : '项目管理';
      const userPath = '用户管理 / 用户详情';
      const orderPath = '订单管理 / 订单详情';
      const passagePath = '通行管理 / 通行记录详情';
      const refundPath = '财务管理 / 退款详情';
      const invoicePath = '财务管理 / 发票详情';
      const settlementPath = '财务管理 / 清分详情';
      document.getElementById('breadcrumb').textContent = current === 'projects' && garageSubpage !== 'list' ? garagePath : current === 'users' && userSubpage === 'detail' ? userPath : current === 'orders' && orderSubpage === 'detail' ? orderPath : current === 'passages' && passageSubpage === 'detail' ? passagePath : current === 'refunds' && refundSubpage === 'detail' ? refundPath : current === 'invoices' && invoiceSubpage === 'detail' ? invoicePath : current === 'clearing' && settlementSubpage === 'detail' ? settlementPath : (item ? item[2] : '项目管理');
    }
    function switchPage(id) {
      if ((id === 'systemUsers' || id === 'logs') && currentAccountType !== '超级管理员') id = 'projects';
      current = id; if (id !== 'projects') garageSubpage = 'list'; if (id !== 'users') userSubpage = 'list'; if (id !== 'orders') orderSubpage = 'list'; if (id !== 'passages') passageSubpage = 'list'; if (id !== 'refunds') refundSubpage = 'list'; if (id !== 'invoices') invoiceSubpage = 'list'; if (id !== 'clearing') settlementSubpage = 'list'; render();
    }
    function render() { renderMenu(); document.getElementById('page').innerHTML = pages[current](); }
    const invoiceUploads = {
      NS202609080002: { names: ['非税收入电子票据-演示样票.svg'], url: 'assets/receipt-demo-960.svg', kind: 'image', uploadedAt: '2026-09-08 11:00' },
      INV202609080001: { names: ['停车月租发票-1680元演示样票.svg'], sample: true, uploadedAt: '2026-09-08 10:00' },
      INV202609070006: { names: ['停车月租发票-演示样票.svg'], url: 'assets/invoice-demo-800.svg', kind: 'image', uploadedAt: '2026-09-07 15:30' },
      INV202609070007: { names: ['电子发票_02.svg'], sample: true, uploadedAt: '2026-09-07 15:31' }
    };
    const invoiceIssued = status => ['已开', '已开具', '已完成', '已上传'].includes(status);
    const isTicketRow = row => /票据/.test(String(row?.[4] || ''));
    const invoiceNoun = ticket => ticket ? '票据' : '发票';
    const invoiceImportedRows = [];
    const invoiceWithdrawals = {};
    const invoiceStamp = () => { const now = new Date(); const pad = value => String(value).padStart(2, '0'); return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`; };
    const invoiceOperator = () => currentAccountType === '超级管理员' ? '超级管理员' : currentLoginName;
    const invoiceRowStatus = value => value === '已撤回' ? '已撤回' : invoiceIssued(value) ? '已开' : '未开';
    const isWithdrawnRow = value => value === '已撤回';
    const invoiceRows = () => {
      const staticRows = [['INV202609080001','AS202608280018','王敏','锦绣安置房','增值税普通发票','¥1,680.00','未开','2026-09-08'],['INV202609070006','AS202608270012','王敏','锦绣安置房','增值税普通发票','¥800.00','已开','2026-09-07'],['INV202609070007','AS202608270012','王敏','锦绣安置房','增值税普通发票','¥160.00','已开','2026-09-07'],['NS202609080002','AS202608280017','陈涛','文庭商房','非税票据','¥960.00','未开','2026-09-08'],['NS202609060003','AS202608260010','李媛','文庭商房','非税票据','¥1,080.00','未开','2026-09-06']];
      const submittedRows = Object.values(orderInvoiceApplications).map(application => [application.id, application.orderNo, application.owner, application.project, application.type, application.amount, invoiceIssued(application.status) ? '已开' : '未开', application.submittedAt.slice(0, 10)]);
      return [...submittedRows, ...staticRows, ...invoiceImportedRows].map(row => invoiceWithdrawals[row[0]] ? [...row.slice(0, 6), '已撤回', row[7]] : invoiceUploads[row[0]] ? [...row.slice(0, 6), '已开', row[7]] : row);
    };
    function invoiceTableHtml(rows) {
      const normalizedRows = rows.map(row => [...row.slice(0, 6), invoiceRowStatus(row[6]), row[7]]);
      const statusTag = status => status === '已开' ? 'success' : status === '已撤回' ? 'gray' : 'warning';
      const displayRows = normalizedRows.map(row => [...row.slice(0, 6), `__html__${tag(row[6], statusTag(row[6]))}`, row[7]]);
      return table([['开票记录编号','170px'],['订单号','170px'],['申请用户','100px'],['小区项目','140px'],['发票类型','160px'],['开票金额','130px'],['开票状态','100px'],['申请时间','150px'],['操作','200px']], displayRows, (r, index)=>`<button class="btn-text" onclick="openInvoiceDetail('${r[0]}')">详情</button><button class="btn-text" onclick="openInvoiceUpload('${r[0]}')">${normalizedRows[index][6] === '未开' ? '上传' : '重传'}</button>${normalizedRows[index][6] === '已开' ? `<button class="btn-text danger" onclick="openInvoiceWithdraw('${r[0]}')">撤回</button>` : ''}`);
    }
    function openInvoiceDetail(id) { selectedInvoiceId = id; invoiceSubpage = 'detail'; current = 'invoices'; render(); }
    function backToInvoices() { invoiceSubpage = 'list'; selectedInvoiceId = ''; current = 'invoices'; render(); }
    const invoiceText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let invoicePreview = { ids: [], index: 0, orderMode: false };
    function sampleInvoiceImage(row) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620"><rect width="1000" height="620" fill="#fffdf8"/><g font-family="sans-serif" fill="#80554d"><text x="500" y="65" text-anchor="middle" font-size="30">电子发票（普通发票）</text><text x="500" y="99" text-anchor="middle" font-size="16">演示样票 · 非真实发票 · 不可报销</text><path d="M45 120H955 M45 126H955" stroke="#b28c7e"/><text x="55" y="160" font-size="17">记录编号：${invoiceText(row[0])}</text><text x="55" y="198" font-size="17">关联订单：${invoiceText(row[1])}</text><rect x="45" y="223" width="910" height="288" fill="none" stroke="#b28c7e"/><path d="M45 313H955 M45 359H955 M45 451H955 M510 223V313" stroke="#b28c7e"/><text x="65" y="257" font-size="18">购买方：${invoiceText(row[2])}</text><text x="65" y="289" font-size="16">项目：${invoiceText(row[3])}</text><text x="530" y="257" font-size="18">销售方：安商房运营公司（演示）</text><text x="65" y="343" font-size="17">项目名称</text><text x="590" y="343" font-size="17">数量</text><text x="790" y="343" font-size="17">金额</text><text x="65" y="406" font-size="19">停车月租服务费</text><text x="605" y="406" font-size="19">1</text><text x="790" y="406" font-size="19">${invoiceText(row[5])}</text><text x="65" y="489" font-size="20">价税合计</text><text x="790" y="489" font-size="23">${invoiceText(row[5])}</text><text x="55" y="555" font-size="17">开票日期：${invoiceText(row[7])}</text><text x="955" y="590" text-anchor="end" font-size="14">仅用于原型预览</text></g></svg>`;
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27');
    }
    function invoicePreviewHtml() {
      const { ids, index, orderMode } = invoicePreview;
      const row = invoiceRows().find(item => item[0] === ids[index]);
      const upload = row && invoiceUploads[row[0]];
      const noun = invoiceNoun(invoicePreview.ticket);
      if (!row || !upload) return `<div class="empty">暂无${noun}</div>`;
      const src = upload.sample ? sampleInvoiceImage(row) : upload.url;
      const image = upload.sample || upload.kind === 'image';
      const content = !src ? `<div class="empty">暂无可预览${noun}文件，请重新上传</div>` : image
        ? `<img src="${invoiceText(src)}" alt="${invoiceText(row[0])} ${noun}" style="display:block;width:100%;height:auto;max-height:50vh;object-fit:contain">`
        : `<object data="${invoiceText(src)}" type="application/pdf" style="width:100%;height:50vh"><p>浏览器不支持内嵌预览，<a href="${invoiceText(src)}" target="_blank" rel="noopener">打开PDF</a></p></object>`;
      const nav = orderMode && ids.length > 1 ? `<div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-top:16px"><button class="btn-text" onclick="changeInvoicePreview(-1)" ${index === 0 ? 'disabled style="opacity:.4;cursor:default"' : ''}>上一张</button><span>${index + 1} / ${ids.length}</span><button class="btn-text" onclick="changeInvoicePreview(1)" ${index === ids.length - 1 ? 'disabled style="opacity:.4;cursor:default"' : ''}>下一张</button></div>` : '';
      return `<div>${content}${nav}</div>`;
    }
    function showInvoicePreview(ids, orderMode, fallbackNoun) {
      const selected = invoiceRows().filter(item => ids.includes(item[0]));
      const ticket = selected.length ? selected.every(isTicketRow) : fallbackNoun === '票据';
      invoicePreview = { ids, index: 0, orderMode, ticket };
      showModal(`查看${invoiceNoun(ticket)}`, invoicePreviewHtml());
      document.querySelector('#modalMask .modal')?.classList.add('invoice-preview-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '关闭'; cancelButton.className = 'btn btn-primary'; cancelButton.onclick = hideModal; }
      if (confirmButton) confirmButton.style.display = 'none';
    }
    function openInvoiceFiles(orderNo) {
      const orderRows = invoiceRows().filter(row => row[1] === orderNo && !isWithdrawnRow(row[6]));
      showInvoicePreview(orderRows.filter(row => invoiceUploads[row[0]]).map(row => row[0]), true, invoiceNoun(orderRows.length > 0 && orderRows.every(isTicketRow)));
    }
    function openSingleInvoice(id) {
      showInvoicePreview(invoiceUploads[id] ? [id] : [], false, invoiceNoun(isTicketRow(invoiceRows().find(item => item[0] === id))));
    }
    function changeInvoicePreview(step) {
      const next = invoicePreview.index + step;
      if (next < 0 || next >= invoicePreview.ids.length) return;
      invoicePreview.index = next;
      document.getElementById('modalBody').innerHTML = invoicePreviewHtml();
    }
    function invoiceDetailPage() {
      const row = invoiceRows().find(item => item[0] === selectedInvoiceId) || invoiceRows()[0];
      const order = orders.find(item => item[0] === row[1]);
      const application = Object.values(orderInvoiceApplications).find(item => item.id === row[0]);
      const type = row[4];
      const ticket = isTicketRow(row);
      const noun = invoiceNoun(ticket);
      const title = `${noun}详情`;
      const upload = invoiceUploads[row[0]];
      return `${innerPageHead(title, 'backToInvoices()')}<section class="detail-page-section"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h3 class="detail-page-title" style="margin:0">${noun}信息</h3><button class="btn-text" onclick="openSingleInvoice('${row[0]}')">查看${noun}</button></div><div class="detail-info-grid">${infoItem('开票记录编号', row[0])}${infoItem('开票状态', tag(row[6]))}${infoItem(`${noun}类型`, type)}${infoItem('申请时间', row[7])}${infoItem('申请用户', row[2])}${infoItem('小区项目', row[3])}${infoItem('开票抬头', application?.title || row[2])}${infoItem('联系手机号', application?.phone || '暂无')}${infoItem('统一社会信用代码', application?.taxNo || '暂无')}${infoItem('上传时间', upload?.uploadedAt || '暂无')}</div></section><section class="detail-page-section"><h3 class="detail-page-title">关联订单</h3><div class="detail-info-grid">${infoItem('订单号', row[1])}${infoItem('订单金额', order?.[8] || `¥${(invoiceRows().filter(item => item[1] === row[1]).reduce((sum, item) => sum + Math.round(Number(String(item[5]).replace(/[^\d.]/g, '')) * 100), 0) / 100).toFixed(2)}`)}${infoItem('订单类型', order?.[4] || '月租订单')}${infoItem('办理车辆', order?.[3] || '暂无')}${infoItem('月租周期', '以订单详情为准')}${infoItem('开票金额', row[5])}</div></section>`;
    }
    function filterInvoices() {
      const keyword = document.getElementById('invoiceKeyword')?.value.trim().toLowerCase() || '';
      const type = document.getElementById('invoiceTypeFilter')?.dataset.value || '';
      const status = document.getElementById('invoiceStatusFilter')?.dataset.value || '';
      const rows = invoiceRows().filter(row => (!keyword || row.slice(0, 4).some(value => String(value).toLowerCase().includes(keyword))) && (!status || row[6] === status) && (!type || type === 'all' || (type === 'ticket') === /票据/.test(row[4])));
      const target = document.getElementById('invoiceTable');
      if (target) target.innerHTML = invoiceTableHtml(rows);
    }
    function resetInvoiceFilters() {
      const input = document.getElementById('invoiceKeyword'); if (input) input.value = '';
      resetFilterDropdown('invoiceStatusFilter');
      resetFilterDropdown('invoiceTypeFilter');
      filterInvoices();
    }
    function invoiceUploadBody(title, multiple = false) { return `<div class="invoice-upload-form"><div class="invoice-upload-title">${title}</div><label class="create-upload"><input id="invoiceUploadFile" type="file" accept=".pdf,.jpg,.jpeg,.png" ${multiple ? 'multiple' : ''} onchange="document.getElementById('invoiceUploadName').textContent = this.files.length ? Array.from(this.files).map(file => file.name).join('、') : '未选择文件'"><button type="button" class="btn" onclick="document.getElementById('invoiceUploadFile').click()">选择文件</button><span id="invoiceUploadName" class="create-upload-name">未选择文件</span></label></div>`; }
    function openInvoiceUpload(id) {
      const row = invoiceRows().find(item => item[0] === id);
      if (!row) return;
      const reupload = row[6] === '已开' || Boolean(invoiceWithdrawals[id]);
      const noun = invoiceNoun(isTicketRow(row));
      showModal(reupload ? `重传${noun}` : `上传${noun}`, invoiceUploadBody(`${reupload ? '重新上传' : '上传'}申请单 ${id} 的票据文件${reupload ? '，确认后替换原票据文件' : ''}`) + '<div id="invoiceUploadError" class="approval-error"></div>');
      const confirm = document.getElementById('modalConfirmButton');
      if (confirm) {
        confirm.textContent = reupload ? '确认重传' : '确认上传';
        confirm.onclick = () => {
          const files = Array.from(document.getElementById('invoiceUploadFile')?.files || []);
          const error = document.getElementById('invoiceUploadError');
          if (files.length !== 1 || files.some(file => !/\.(pdf|jpe?g|png)$/i.test(file.name))) {
            if (error) error.textContent = !files.length ? '请先选择票据文件' : files.length !== 1 ? '每条开票记录只能上传一张发票' : '仅支持 PDF、JPG、JPEG、PNG 文件';
            return;
          }
          const file = files[0];
          const url = URL.createObjectURL(file);
          const previousUrl = invoiceUploads[id]?.url;
          invoiceUploads[id] = { names: [file.name], url, kind: /\.pdf$/i.test(file.name) ? 'pdf' : 'image', uploadedAt: new Date().toLocaleString('zh-CN', { hour12: false }) };
          if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
          const application = Object.values(orderInvoiceApplications).find(item => item.id === id);
          if (application) application.status = '已完成';
          orderInvoiceStatus[row[1]] = '已完成';
          delete invoiceWithdrawals[id];
          hideModal();
          if (current === 'invoices' && invoiceSubpage === 'list') filterInvoices(); else render();
        };
      }
    }
    function openInvoiceWithdraw(id) {
      const row = invoiceRows().find(item => item[0] === id);
      if (!row || row[6] !== '已开') return;
      const noun = invoiceNoun(isTicketRow(row));
      showModal(`撤回${noun}`, `<div class="modal-tip">该${noun}已推送至车主小程序。撤回后车主端不再展示、不可下载，订单开票状态退回“未开”，本次撤回会记入操作日志。</div><div class="detail-info-grid invoice-withdraw-grid">${infoItem('开票记录编号', row[0])}${infoItem('订单号', row[1])}${infoItem('车主', row[2])}${infoItem('开票金额', row[5])}</div><div class="invoice-withdraw-reason"><label class="form-label" for="invoiceWithdrawReason">撤回原因</label><textarea id="invoiceWithdrawReason" class="form-control" rows="3" maxlength="200" placeholder="例如：上传时选错订单 / 选错车主"></textarea></div><div id="invoiceWithdrawError" class="approval-error"></div>`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '确认撤回'; confirmButton.onclick = () => confirmInvoiceWithdraw(id); }
    }
    function confirmInvoiceWithdraw(id) {
      const row = invoiceRows().find(item => item[0] === id);
      if (!row) return;
      const error = document.getElementById('invoiceWithdrawError');
      const reason = document.getElementById('invoiceWithdrawReason')?.value.trim() || '';
      if (!reason) { if (error) error.textContent = '请填写撤回原因，便于后续追溯'; return; }
      const noun = invoiceNoun(isTicketRow(row));
      invoiceWithdrawals[id] = { reason, operator: invoiceOperator(), at: invoiceStamp() };
      const application = Object.values(orderInvoiceApplications).find(item => item.id === id);
      if (application) application.status = '待开票';
      if (orderInvoiceStatus[row[1]] === '已完成') delete orderInvoiceStatus[row[1]];
      operationLogs.unshift([invoiceOperator(), '财务管理 / 开票管理', '撤回开票记录', row[0], `撤回${noun}（订单 ${row[1]} · 车主 ${row[2]} · ${row[5]}），原因：${reason}；车主小程序已同步不再展示，订单开票状态退回未开`, '成功', invoiceStamp()]);
      hideModal();
      if (current === 'invoices' && invoiceSubpage === 'list') filterInvoices(); else render();
    }
    const invoiceBatchFields = [['订单号','发票所属的月租订单编号，可重复，同一订单可多行','AS202608280018'],['用户名','订单对应的车主姓名','王敏'],['发票图的URL','发票图片或 PDF 的完整链接，需以 http:// 或 https:// 开头','https://example.com/invoice/1.png']];
    function invoiceBatchBody() {
      return `<div class="invoice-upload-form"><div class="invoice-upload-title has-sample-link"><span>上传字段说明：</span><a class="invoice-sample-link" href="javascript:;" onclick="downloadInvoiceBatchSample()">点击下载文件示例</a></div><table class="invoice-field-table"><thead><tr><th style="width:150px">字段</th><th>说明</th><th style="width:250px">示例</th></tr></thead><tbody>${invoiceBatchFields.map(([name, desc, sample]) => `<tr><td>${name}</td><td>${desc}</td><td class="invoice-field-sample">${sample}</td></tr>`).join('')}</tbody></table><label class="create-upload"><input id="invoiceBatchFile" type="file" accept=".csv" onchange="document.getElementById('invoiceUploadName').textContent = this.files.length ? this.files[0].name : '未选择文件'"><button type="button" class="btn" onclick="document.getElementById('invoiceBatchFile').click()">选择文件</button><span id="invoiceUploadName" class="create-upload-name">未选择文件</span></label></div>`;
    }
    function downloadInvoiceBatchSample() {
      const header = invoiceBatchFields.map(([name]) => name);
      const sampleRows = [['AS202608280018', '王敏', 'https://example.com/invoice/1.png'], ['AS202608270012', '李强', 'https://example.com/invoice/2.png']];
      const lines = [header, ...sampleRows].map(row => row.map(cell => (/[",\n]/.test(cell) ? csvCell(cell) : cell)).join(','));
      downloadCsv('批量上传发票-文件示例.csv', lines, '\r\n');
    }
    function parseInvoiceBatchCsv(text) {
      const lines = String(text ?? '').replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(line => line.length);
      if (!lines.length) return { error: 'CSV 文件内容为空，请按字段说明准备文件' };
      const splitCells = line => {
        const out = []; let value = ''; let quoted = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (quoted) {
            if (char === '"' && line[i + 1] === '"') { value += '"'; i++; }
            else if (char === '"') quoted = false;
            else value += char;
          } else if (char === '"') quoted = true;
          else if (char === ',') { out.push(value.trim()); value = ''; }
          else value += char;
        }
        out.push(value.trim());
        return out;
      };
      const rows = [];
      for (let index = 0; index < lines.length; index++) {
        const values = splitCells(lines[index]);
        if (index === 0 && !/^https?:/i.test(values[2] || '') && /订单号|order/i.test(values[0] || '')) continue;
        if (values.length < 3 || values.slice(0, 3).some(value => !value)) return { error: `CSV 第 ${index + 1} 行字段不完整，需要 订单号、用户名、发票图的URL` };
        if (!/^https?:\/\//i.test(values[2])) return { error: `CSV 第 ${index + 1} 行发票图的URL需以 http:// 或 https:// 开头` };
        if (rows.length >= 50) return { error: '一次最多导入 50 张发票，请分批上传' };
        rows.push({ orderNo: values[0], owner: values[1], url: values[2] });
      }
      if (!rows.length) return { error: 'CSV 中没有可导入的发票数据行' };
      return { rows };
    }
    function openBatchInvoiceUpload() {
      showModal('批量上传发票', invoiceBatchBody() + '<div id="invoiceUploadError" class="approval-error"></div>');
      const confirm = document.getElementById('modalConfirmButton');
      if (!confirm) return;
      confirm.textContent = '确认上传';
      confirm.onclick = () => {
        const file = document.getElementById('invoiceBatchFile')?.files?.[0];
        const error = document.getElementById('invoiceUploadError');
        if (!file) { if (error) error.textContent = '请先选择 CSV 文件'; return; }
        if (!/\.csv$/i.test(file.name)) { if (error) error.textContent = '仅支持 CSV 文件'; return; }
        const reader = new FileReader();
        reader.onerror = () => { if (error) error.textContent = '文件读取失败，请重新选择'; };
        reader.onload = () => {
          const result = parseInvoiceBatchCsv(reader.result);
          if (result.error) { if (error) error.textContent = result.error; return; }
          const stamp = Date.now().toString().slice(-6);
          const today = new Date().toISOString().slice(0, 10);
          const importedAt = new Date().toLocaleString('zh-CN', { hour12: false });
          result.rows.forEach((item, index) => {
            const order = orders.find(entry => entry[0] === item.orderNo);
            const id = `FP${today.replace(/-/g, '')}${stamp}${String(index + 1).padStart(2, '0')}`;
            invoiceImportedRows.push([id, item.orderNo, item.owner, order?.[1] || '暂无', order?.[10] === '票据' ? '非税票据' : '增值税普通发票', order?.[8] || '暂无', '未开', today]);
            invoiceUploads[id] = { names: [decodeURIComponent(item.url.split('/').pop().split('?')[0]) || '发票文件'], url: item.url, kind: /\.pdf$/i.test(item.url.split('?')[0]) ? 'pdf' : 'image', uploadedAt: importedAt, external: true };
          });
          hideModal();
          showModal('批量上传完成', `已按 CSV 导入 ${result.rows.length} 张发票，来源为发票图的URL，可在列表中查看。`);
          if (current === 'invoices' && invoiceSubpage === 'list') filterInvoices(); else render();
        };
        reader.readAsText(file, 'utf-8');
      };
    }
    const operationLogs = [
      ['admin','财务管理','撤回开票记录','IV202608280018','撤回发票（订单 AS202608280018 · 车主 王敏 · ¥1,680.00），原因：上传时选错用户；车主小程序已同步不再展示，订单开票状态退回未开','成功','2026-09-16 11:42'],
      ['finance01 / 张敏','财务管理','审批通过（调整金额）','RF202609100002','核定金额 ¥1,200.00→¥980.00，调整原因"按剩余租期折算"，转待用户确认','成功','2026-09-16 10:15'],
      ['admin','财务管理','批量导入开票记录','CSV：4 行','导入 4 条开票记录，成功 3 条、跳过 1 条（订单 AS202608260010 已开票）','成功','2026-09-16 09:58'],
      ['admin','项目管理','发布项目','锦绣安置房','车场编号 YL-PARK-330102-001 与月租车费校验通过，项目发布到小程序','成功','2026-09-15 17:20'],
      ['admin','用户管理','查看完整信息','USR-王敏-001','查看用户完整信息：手机号、身份证号、退款收款账号（敏感操作，仅超级管理员）','成功','2026-09-15 16:44'],
      ['ops02 / 陈露','通行管理','重试通行同步','SYNC20260828002','重新推送车辆月租通行权限至一路停车失败：车场编号无效','失败','2026-09-15 15:31'],
      ['finance01 / 张敏','财务管理','审批驳回','RF202609090007','驳回退款申请，原因"车辆仍在月租有效期内正常通行"','成功','2026-09-15 14:02'],
      ['property01 / 刘伟','订单管理','变更车辆','AS202608280018','第二辆车浙AD91F8→浙A0P7H3，已推送一路停车并更新通行权限','成功','2026-09-15 11:26'],
      ['admin','系统管理','新增账号','property02','新增普通账号 property02，初始密码 123456，需首次登录修改','成功','2026-09-15 10:08'],
      ['admin','项目管理','编辑项目','文庭商房','月租车费 320→350 元/月，维护车位 3→5，项目保持已发布','成功','2026-09-14 18:12'],
      ['property01 / 刘伟','订单管理','生成续费订单','AS20260812009','生成续费订单 AS202609150026，续费 12 个月，金额 ¥1,680.00','成功','2026-09-14 15:07'],
      ['ops02 / 陈露','通行管理','换绑车牌','CP20260828001','旧车牌浙A92Q8L 取消通行权限，新车牌浙A18N6P 已推送一路停车并更新权限','成功','2026-09-14 11:33'],
      ['admin','项目管理','同步车位数据','全部项目','从一路停车拉取车位资源，更新 4 个项目，可办理车位 66→62','成功','2026-09-13 17:41'],
      ['finance01 / 张敏','财务管理','手动清分','AS202608280016','对清分异常订单发起人工清分，金额 ¥1,200.00，清分状态：清分处理中','成功','2026-09-13 15:22'],
      ['property01 / 刘伟','订单管理','撤销退款申请','AS202608280016','撤销退款申请 RF202609150003，订单恢复"月租有效"，通行恢复','成功','2026-09-13 10:19'],
      ['admin','系统管理','重置密码','finance01','重置账号密码，初始密码恢复为 123456，需下次登录修改','成功','2026-09-12 16:35'],
      ['property01 / 刘伟','用户管理','查看用户详情','USR-林静-003','查看用户基本信息：姓名、手机号、车牌、月租状态','成功','2026-09-12 09:47'],
      ['ops02 / 陈露','通行管理','批量推送','已选 5 条订单','批量推送审核通过订单至一路停车，成功 4 条、失败 1 条','成功','2026-09-11 17:53'],
      ['admin','项目管理','新增收费项目','荣和家园 · 物业服务费','新增收费项目，标准 60.00 元/月，收款说明：物业商户清分','成功','2026-09-11 14:28'],
      ['finance01 / 张敏','财务管理','审批通过','RF202608250006','退款审批通过，金额 ¥1,200.00，订单状态已终止、通行失效','成功','2026-09-10 15:10'],
      ['property09','系统管理','登录失败','property09','登录失败：用户名或密码错误','失败','2026-09-10 09:02'],
      ['property01 / 刘伟','订单管理','提交开票申请','AS202608280017','提交发票申请，抬头与税号按用户填写内容提交，进入待开票','成功','2026-09-09 11:05']
    ];
    const pages = {
      dashboard() {
        return dashboardPage();
      },
      projects() {
        if (garageSubpage === 'detail') return garageDetailPage();
        if (garageSubpage === 'edit') return garageEditPage();
        return pageShell('小区项目', '', `<div class="filter-bar garage-filter-bar"><input id="garageKeyword" class="input" type="search" placeholder="小区名称" autocomplete="off" oninput="filterGarages()"><div id="garageProjectDropdown" class="filter-dropdown"><button id="garageProjectTrigger" class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleGarageProjectMenu(event)"><span id="garageProjectTypeLabel">全部项目类型</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="garageProjectMenu" class="select-menu" role="listbox"><button type="button" class="select-option active" data-value="" onclick="selectGarageProject('', '全部项目类型')">全部项目类型</button><button type="button" class="select-option" data-value="公司自营项目" onclick="selectGarageProject('公司自营项目', '公司自营项目')">公司自营项目</button><button type="button" class="select-option" data-value="区财政代管项目" onclick="selectGarageProject('区财政代管项目', '区财政代管项目')">区财政代管项目</button></div></div><div id="garagePublishStatusDropdown" class="filter-dropdown"><button id="garagePublishStatusTrigger" class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleGaragePublishStatusMenu(event)"><span id="garagePublishStatusLabel">全部发布状态</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="garagePublishStatusMenu" class="select-menu" role="listbox"><button type="button" class="select-option active" data-value="" onclick="selectGaragePublishStatus('', '全部发布状态')">全部发布状态</button><button type="button" class="select-option" data-value="已发布" onclick="selectGaragePublishStatus('已发布', '已发布')">已发布</button><button type="button" class="select-option" data-value="草稿" onclick="selectGaragePublishStatus('草稿', '草稿')">草稿</button></div></div><button class="btn btn-primary" onclick="filterGarages()">查询</button><button class="btn" onclick="resetGarageFilters()">重置</button><button class="btn btn-primary" onclick="openCreateGarage()">新增小区项目</button></div><section class="panel garage-table-panel"><div id="garageTable">${garageTableHtml(garages)}</div></section>`);
      },
      spaces() {
        const rows = [['锦绣安置房','320','246','8','66','可办理'],['文庭商房','186','171','3','12','可办理'],['荣和家园','240','0','0','0','暂停办理'],['江南新寓','150','150','0','0','已满']];
        return pageShell('车位资源', '', panel('车位资源配置与状态', `${filters([['input','小区名称'],['select','资源状态',['全部','可办理','暂停办理','已满']]])}<button class="btn" onclick="showModal('同步车位数据','将从一路停车平台拉取最新车位资源数据并记录同步结果。')">同步车位</button>${table([['小区名称','180px'],['总车位','100px'],['已租车位','110px'],['维修中','110px'],['可办理数量','120px'],['办理状态','120px'],['操作','120px']], rows, (r)=>`<button class="btn-text" onclick="openGarageDetail('${r[0]}')">查看项目</button><button class="btn-text" onclick="openGarageEdit('${r[0]}')">编辑</button>`)}`));
      },
      fees() {
        const rows = [['锦绣安置房','月租费','¥400.00 / 月','启用','随项目合并支付'],['锦绣安置房','物业服务费','¥60.00 / 月','启用','物业商户清分'],['文庭商房','月租费','¥320.00 / 月','启用','按项目规则收取'],['荣和家园','其他费用','¥0.00','停用','未配置']];
        return pageShell('收费项目', '', panel('收费项目与标准配置', `${filters([['input','小区名称'],['select','收费项目',['全部','月租费','物业服务费','其他费用']],['select','启用状态',['全部','启用','停用']]])}<button class="btn btn-primary" onclick="showModal('新增收费项目','为指定小区配置收费项目、收费金额或计算规则。订单创建后保存费用明细快照。')">新增收费项目</button>${table([['小区名称','170px'],['收费项目','140px'],['收费标准','170px'],['状态','100px'],['收款说明','220px'],['操作','150px']], rows, (r)=>`<button class="btn-text" onclick="showModal('编辑收费项目','${r[0]} · ${r[1]} 的收费规则可修改，历史订单金额不受影响。')">编辑</button><button class="btn-text danger">停用</button>`)}`));
      },
      settlement() {
        const rows = [['锦绣安置房','月租费','安商房运营公司','MKT3301020001','按收费项全额分配','已启用'],['锦绣安置房','物业服务费','锦绣物业服务有限公司','MKT3301020038','按收费项全额分配','已启用'],['文庭商房','月租费','区财政非税收入专户','MKT3301020042','固定金额分配','已启用'],['江南新寓','物业服务费','未配置','暂无商家编号','暂无清分规则','未配置']];
        return pageShell('收款与清分', '', panel('收款账户与清分配置', `${filters([['input','小区名称/商户编号'],['select','收费项目',['全部','月租费','物业服务费','其他费用']],['select','账户状态',['全部','已启用','未配置']]])}<button class="btn btn-primary" onclick="showModal('新增收款配置','按小区和收费项目维护收款主体、结算平台商家编号、清分规则和模式。')">新增收款配置</button>${table([['小区名称','170px'],['收费项目','130px'],['收款主体','190px'],['商户编号','160px'],['清分规则','170px'],['账户状态','110px'],['操作','150px']], rows, (r)=>`<button class="btn-text" onclick="showModal('清分配置详情','${r[0]} · ${r[1]} 使用结算平台商户编号 ${r[3]}，订单创建时会保存配置快照。')">详情</button><button class="btn-text">编辑</button>`)}`));
      },
      materials() {
        const rows = [['锦绣安置房','月租办理告知书','V1.2','支付成功后自动生效','已启用','2026-08-20'],['锦绣安置房','物业服务告知书','V1.0','支付成功后自动同步','已启用','2026-08-20'],['文庭商房','月租办理指引','V2.1','异常时进入待处理事项','已启用','2026-08-18'],['荣和家园','月租办理告知书','V1.0','待完善','草稿','2026-08-18']];
        return pageShell('办理资料', '', panel('办理资料配置', `${filters([['input','小区名称/资料名称'],['select','资料状态',['全部','已启用','草稿']]])}<button class="btn btn-primary" onclick="showModal('新增办理资料','上传告知书或办理指引，维护名称、版本、办理地点和用户端展示说明。')">新增办理资料</button>${table([['小区名称','170px'],['资料名称','190px'],['版本','90px'],['办理说明','190px'],['状态','100px'],['更新时间','130px'],['操作','150px']], rows, (r)=>`<button class="btn-text" onclick="showModal('查看资料','${r[1]} ${r[2]} 已配置为项目资料，可查看原文件内容。')">查看</button><button class="btn-text">编辑</button>`)}`));
      },
      users() {
      return pageShell('用户管理', '', `${filters([['input','姓名/手机号/车牌','', 'userKeyword', 'filterUsers'],['select','月租状态',['全部','月租有效','月租待生效','退款处理中','月租已过期','未办理'], 'userStatusFilter', 'filterUsers']], '', 'filter-bar garage-filter-bar user-filter-bar', { query: 'filterUsers', reset: 'resetUserFilters' })}<section class="panel garage-table-panel"><div id="userTable">${userTableHtml(rentUsers)}</div></section>`);
      },
      vehicles() {
        const rows = [['浙A8P62K','蓝牌','小型车','王敏','锦绣安置房 · 订单 AS202608280018','有效'],['浙AD91F8','蓝牌','小型车','王敏','锦绣安置房 · 订单 AS202608280018','有效'],['浙A36M2Q','蓝牌','小型车','陈涛','文庭商房 · 订单 AS202608280017','有效'],['浙A7H21D','蓝牌','小型车','林静','未绑定有效月租','已绑定']];
        return pageShell('车辆与绑定', '', panel('车辆信息与绑定关系', `${filters([['input','车牌号/姓名/手机号'],['select','车牌颜色',['全部','蓝牌','新能源']],['select','绑定状态',['全部','已绑定','未绑定有效月租']]])}${table([['车牌号','130px'],['车牌颜色','100px'],['车辆类型','110px'],['账号姓名','110px'],['绑定关系','260px'],['车辆状态','110px'],['操作','150px']], rows, (r)=>`<button class="btn-text" onclick="showModal('车辆详情','车牌 ${r[0]} · ${r[2]} · 账号 ${r[3]}。车辆照片和绑定关系可在此查看。')">详情</button><button class="btn-text" onclick="showModal('解除绑定','已绑定有效月租的车辆不能直接解除，需要从订单执行换绑或移除第二辆车辆。')">处理</button>`)}`));
      },
      orders() {
        const listRows = orders.map(r => [r[0], r[1], r[3], r[5], r[7], r[8]]);
        return pageShell('订单查询', '', `${filters([['input','订单号/小区/车主/车牌','', 'orderKeyword', 'filterOrders'],['select','订单类型',['全部','新办','续费'], 'orderTypeFilter', 'filterOrders']], '<button class="btn" onclick="openOrderPushConfigModal()">订单推送配置</button>', 'filter-bar garage-filter-bar order-filter-bar', { query: 'filterOrders', reset: 'resetOrderFilters' })}<section class="panel garage-table-panel order-table-panel"><div id="orderTable">${orderTable(listRows)}</div></section>`);
      },
      passages() {
        const projectOptions = ['全部项目', ...new Set(passageRecords.map(record => record.project))];
        return pageShell('通行记录', '', `${filters([['input','车牌号/项目/停车场/记录编号','', 'passageKeyword', 'filterPassages'],['select','项目',projectOptions, 'passageProjectFilter', 'filterPassages'],['select','通行结果',['全部通行结果','正常','异常'], 'passageResultFilter', 'filterPassages'],['select','记录状态',['全部记录状态','场内','已出场','未匹配'], 'passageStatusFilter', 'filterPassages']], '', 'filter-bar garage-filter-bar passage-filter-bar', { query: 'filterPassages', reset: 'resetPassageFilters' })}<section class="panel garage-table-panel"><div id="passageTable">${passageTableHtml(passageRecords)}</div></section>`);
      },
      approval() {
        const rows = [['AS202608280018','锦绣安置房','王敏','浙A8P62K、浙AD91F8','待物业办理','物业联系人：刘经理','2026-08-28 09:24'],['AS202608280016','荣和家园','林静','浙A7H21D','待内部审核','待项目审核人复核','2026-08-28 10:12'],['AS202608280022','文庭商房','胡斌','浙A12M8Q','待推送','审核通过，等待一路停车回执','2026-08-28 11:08'],['AS202608280017','文庭商房','陈涛','浙A36M2Q','通行同步异常','车场编号无效，支持重新同步','2026-08-28 11:30']];
        return pageShell('审核与开通', '', panel('订单开通处理', `${filters([['input','订单号/车主/车牌'],['select','小区项目'],['select','处理状态',['全部','待物业办理','待内部审核','待推送','通行同步异常']],['date','提交日期']], '<button class="btn btn-primary" onclick="showModal(\'批量推送\',\'将选中的审核通过订单批量推送至一路停车平台。\')">批量推送</button>')}${table([['订单号','150px'],['小区','140px'],['车主','90px'],['登记车牌','180px'],['处理状态','130px'],['说明','230px'],['提交时间','150px'],['操作','190px']], rows, (r)=>`<button class="btn-text" onclick="showModal('查看订单','${r[0]} 当前为 ${r[4]}，订单详情包含费用、支付和车辆快照。')">详情</button><button class="btn-text" onclick="showModal('处理节点','确认 ${r[0]} 已完成当前节点，记录处理人和时间。')">处理</button><button class="btn-text" onclick="showModal('重新同步','将车牌、车牌颜色、车辆类型和月租有效期重新推送至一路停车平台。')">同步</button>`)}`));
      },
      plate() {
        const rows = [['CP20260828001','AS20260812009','周伟','浙A92Q8L','浙A18N6P','待审核','未同步'],['CP20260828002','AS20260809012','钱莉','浙AD91F8','浙A0P7H3','审核通过','同步中'],['CP20260827008','AS20260725031','沈明','浙A6C21D','浙A6C2ID','待复核','未同步']];
        return pageShell('车牌变更', '', panel('订单车辆操作记录', `${filters([['input','申请单/订单号/车主/车牌'],['select','审核状态',['全部','待审核','审核通过','未通过']],['select','同步状态',['全部','未同步','同步中','已同步']]])}${table([['申请单号','150px'],['原订单号','150px'],['车主','90px'],['原车牌','120px'],['新车牌','120px'],['审核状态','120px'],['同步状态','110px'],['操作','180px']], rows, (r)=>`<button class="btn-text" onclick="showModal('换绑审核','审核通过后将旧车牌取消权限，新车牌推送一路停车平台。')">审核</button><button class="btn-text" onclick="showModal('查看附件','本期仅预留车辆资料附件查看与人工复核入口，证件识别服务待评估。')">附件</button><button class="btn-text" onclick="showModal('重新同步','重新推送新旧车牌权限变更，并记录平台回执。')">同步</button>`)}`));
      },
      payments() {
        const rows = settlementRecords;
        return pageShell('支付与清分', '', `${filters([['select','清分状态',['全部','已清分','清分处理中','清分异常']]], '', 'filter-bar garage-filter-bar finance-filter-bar')}<section class="panel garage-table-panel">${table([['业务订单号','180px'],['支付流水号','190px'],['小区项目','150px'],['支付金额','130px'],['清分金额','130px'],['清分日期','150px'],['清分状态','130px'],['操作','110px']], rows, settlementActions)}</section>`);
      },
      refund() {
        return pageShell('退款审批', '', `${filters([['input','退款单/原订单/车主/车牌','', 'refundKeyword', 'filterRefunds'],['select','退款状态',['全部','待审批','待用户确认','已通过','已驳回'], 'refundStatusFilter', 'filterRefunds']], '', 'filter-bar garage-filter-bar finance-filter-bar', { query: 'filterRefunds', reset: 'resetRefundFilters' })}<section class="panel garage-table-panel refund-table-panel"><div id="refundTable">${refundTableHtml(refunds)}</div></section>`);
      },
      invoices() {
        if (invoiceSubpage === 'detail') return invoiceDetailPage();
        const rows = invoiceRows();
        return pageShell('开票管理', '', `<div class="filter-bar garage-filter-bar finance-filter-bar invoice-filter-bar"><input id="invoiceKeyword" class="input" type="search" placeholder="开票记录编号/订单号/车主" autocomplete="off"><div id="invoiceTypeFilter" class="filter-dropdown" data-filter-label="票据类型" data-filter-action="filterInvoices"><button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleFilterDropdown(event, 'invoiceTypeFilter')"><span>全部票据类型</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="select-menu" role="listbox"><button type="button" class="select-option active" data-value="" onclick="selectFilterOption(event, 'invoiceTypeFilter')">全部票据类型</button><button type="button" class="select-option" data-value="ticket" onclick="selectFilterOption(event, 'invoiceTypeFilter')">非税票据</button><button type="button" class="select-option" data-value="invoice" onclick="selectFilterOption(event, 'invoiceTypeFilter')">发票</button></div></div><div id="invoiceStatusFilter" class="filter-dropdown" data-filter-label="开票状态" data-filter-action="filterInvoices"><button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleFilterDropdown(event, 'invoiceStatusFilter')"><span>全部开票状态</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="invoiceStatusMenu" class="select-menu" role="listbox"><button type="button" class="select-option active" data-value="" onclick="selectFilterOption(event, 'invoiceStatusFilter')">全部开票状态</button><button type="button" class="select-option" data-value="未开" onclick="selectFilterOption(event, 'invoiceStatusFilter')">未开</button><button type="button" class="select-option" data-value="已开" onclick="selectFilterOption(event, 'invoiceStatusFilter')">已开</button><button type="button" class="select-option" data-value="已撤回" onclick="selectFilterOption(event, 'invoiceStatusFilter')">已撤回</button></div></div><button class="btn btn-primary" onclick="filterInvoices()">查询</button><button class="btn" onclick="resetInvoiceFilters()">重置</button><button class="btn" onclick="openBatchInvoiceUpload()">批量上传发票</button></div><section class="panel garage-table-panel"><div id="invoiceTable">${invoiceTableHtml(rows)}</div></section>`);
      },
      systemUsers() {
        return pageShell('账号管理', '', `${filters([['input','用户名'],['select','账号状态',['全部','启用','停用']]], '<button class="btn btn-primary" onclick="openCreateAccountModal()">新增账号</button><button class="btn" onclick="batchDeleteAccounts()" style="margin-left:10px">批量删除</button>', 'filter-bar garage-filter-bar')}<section class="panel garage-table-panel account-table-panel"><div>${table([[' ','56px'],['用户名','180px'],['账号类型','150px'],['状态','120px'],['最后登录时间','180px'],['操作','260px']], systemAccounts, (r)=>`<input type="checkbox" class="account-checkbox" data-username="${r[0]}" ${r[0] === 'admin' ? 'disabled' : ''} onclick="event.stopPropagation()">`, (r)=>`<button class="btn-text" onclick="openResetPasswordModal('${r[0]}')">重置密码</button>${r[0] === 'admin' ? '' : `<button class="btn-text${r[2] === '启用' ? ' danger' : ''}" onclick="toggleAccountStatus('${r[0]}')">${r[2] === '启用' ? '停用' : '启用'}</button><button class="btn-text danger" onclick="deleteAccount('${r[0]}')">删除</button>`}`)}</div></section>`);
      },
      logs() {
        return pageShell('操作日志', '', `${filters([['input','操作人/编号'],['select','操作模块',['全部','项目管理','订单管理','通行管理','财务管理','用户管理','系统管理']]], '', 'filter-bar garage-filter-bar')}<section class="panel garage-table-panel log-table-panel"><div>${table([['操作人','120px'],['操作模块','130px'],['操作类型','120px'],['操作对象','150px'],['操作内容摘要','240px'],['结果','80px'],['操作时间','150px'],['操作','90px']], operationLogs, null, (r,i)=>`<button class="btn-text" onclick="showLogDetail(${i})">查看</button>`, [5])}</div></section>`);
      }
    };

    const leafPages = {
      projects: pages.projects,
      spaces: pages.spaces,
      fees: pages.fees,
      settlement: pages.settlement,
      materials: pages.materials,
      users: pages.users,
      vehicles: pages.vehicles,
      orders: pages.orders,
      passages: pages.passages,
      approval: pages.approval,
      plate: pages.plate,
      payments: pages.payments,
      refund: pages.refund,
      invoices: pages.invoices,
      systemUsers: pages.systemUsers,
      logs: pages.logs
    };

    Object.assign(pages, {
      projects() {
        if (garageSubpage === 'detail') return garageDetailPage();
        if (garageSubpage === 'edit') return garageEditPage();
        if (garageSubpage === 'create') return createGaragePage();
        return pageShell('项目管理', '', withoutTabs(withoutHeader(leafPages.projects())));
      },
      users() {
        if (userSubpage === 'detail') return userDetailPage();
        return pageShell('用户管理', '', withoutTabs(withoutHeader(leafPages.users())));
      },
      orders() {
        if (orderSubpage === 'detail') return orderDetailPage();
        return pageShell('订单管理', '', withoutTabs(withoutHeader(leafPages.orders())));
      },
      passages() {
        if (passageSubpage === 'detail') return passageDetailPage();
        return pageShell('通行记录', '', withoutTabs(withoutHeader(leafPages.passages())));
      },
      refunds() {
        if (refundSubpage === 'detail') return refundDetailPage();
        return pageShell('退款申请', '', withoutPanelHeader(withoutTabs(withoutHeader(leafPages.refund()))));
      },
      clearing() {
        if (settlementSubpage === 'detail') return settlementDetailPage();
        return pageShell('支付与清分', '', withoutPanelHeader(withoutTabs(withoutHeader(leafPages.payments()))));
      },
      invoices() {
        if (invoiceSubpage === 'detail') return invoiceDetailPage();
        return pageShell('开票管理', '', withoutPanelHeader(withoutTabs(withoutHeader(leafPages.invoices()))));
      },
      systemUsers() {
        return pageShell('账号管理', '', withoutTabs(withoutHeader(leafPages.systemUsers())));
      },
      logs() {
        return pageShell('操作日志', '', withoutTabs(withoutHeader(leafPages.logs())));
      }
    });
    render();
