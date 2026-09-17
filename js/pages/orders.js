    function orderActions(r) {
      const order = orders.find(item => item[0] === r[0]);
      if (!order) return `<button class="btn-text" onclick="openOrder('${r[0]}')">详情</button>`;
      const [, , , , , orderStatus, rentStatus, trafficStatus] = order;
      const vehicleData = orderVehicleData(r[0]);
      const actions = [`<button class="btn-text" onclick="openOrder('${r[0]}')">详情</button>`];
      const activeRefund = refundForOrder(r[0]);
      const pendingRefund = activeRefund?.[7] === '待审批';
      if (orderStatus === '退款申请中' && activeRefund?.[7] === '待审批') {
        actions.push(`<button class="btn-text danger" onclick="revokeRefundApplication('${r[0]}')">撤销退款</button>`);
      }
      const canOperatePaidOrder = ['月租有效', '月租待生效'].includes(orderStatus) && rentStatus !== '月租已终止';
      if (canOperatePaidOrder && vehicleData?.plates.length) {
        actions.push(`<button class="btn-text" onclick="openOrderVehicleManage('${r[0]}')">变更车辆</button>`);
      }
      if (canOperatePaidOrder && !activeRefund) {
        if (rentStatus === '月租有效') actions.push(`<button class="btn-text" onclick="openRenewOrder('${r[0]}')">续费</button>`);
        if (trafficStatus === '开通失败') actions.push(`<button class="btn-text" onclick="syncOrderTraffic('${r[0]}')">重新开通</button>`);
        actions.push(`<button class="btn-text" onclick="openOrderRefund('${r[0]}')">退款</button>`);
      }
      const invoiceStatus = orderInvoiceStatus[r[0]];
      const invoiceData = invoiceOrderData(r[0]);
      const invoiceName = invoiceData?.mode === 'ticket' ? '票据' : '发票';
      const invoiceOpenText = invoiceData?.mode === 'ticket' ? '开票据' : '开发票';
      const issuedRecords = invoiceRows().filter(item => item[1] === r[0] && !isWithdrawnRow(item[6]) && invoiceIssued(item[6]));
      const invoiceAction = issuedRecords.length
          ? `<button class="btn-text" onclick="openInvoiceFiles('${r[0]}')">查看${invoiceName}</button>`
          : invoiceStatus === '处理中'
            ? `<button class="btn-text" onclick="showInvoiceApplication('${r[0]}')">查看开票申请</button>`
            : `<button class="btn-text" onclick="openOrderInvoice('${r[0]}')">${invoiceOpenText}</button>`;
      actions.push(invoiceAction);
      return actions.join('');
    }
    function invoiceOrderData(id) {
      const order = orders.find(item => item[0] === id);
      if (!order) return null;
      const ownerUser = rentUsers.find(user => user.userId === order[9] || user.records.some(record => record.orderNo === id));
      const record = ownerUser?.records.find(item => item.orderNo === id);
      return {
        order,
        owner: ownerUser?.name || order[2] || '',
        phone: ownerUser?.phone || '',
        amount: order[8] || record?.amount || '¥0.00',
        mode: order[10] === '票据' ? 'ticket' : 'invoice'
      };
    }
    function invoiceField(id, label, options = {}) {
      const required = options.required ? ' required' : '';
      const type = options.type || 'text';
      const value = options.value || '';
      const placeholder = options.placeholder || '';
      const readonly = options.readonly ? ' readonly' : '';
      return `<div class="modal-form-field${options.full ? ' full' : ''}"><label class="${required}" for="${id}">${label}</label><input id="${id}" class="form-control" type="${type}" value="${value}" placeholder="${placeholder}"${readonly}><div id="${id}Error" class="modal-field-error"></div></div>`;
    }
    function invoiceApplicationForm(id, mode, invoiceType, data) {
      if (mode === 'ticket') {
        return `<div class="modal-tip">票据将按当前缴款人信息开具，完成后可查看电子票据。</div><div class="invoice-form-section"><div class="invoice-form-section-title">缴款人信息</div><div class="modal-form-grid">${invoiceField('invoiceTicketPayer', '缴款人', { value: data.owner, readonly: true })}${invoiceField('invoiceTicketPhone', '联系手机号', { value: data.phone, readonly: true })}</div></div>`;
      }
      const typeOptions = `<div class="invoice-type-options"><button type="button" class="invoice-type-option${invoiceType === 'personal' ? ' active' : ''}" onclick="switchInvoiceType('${id}', 'personal')"><strong>个人发票</strong><span>填写个人抬头</span></button><button type="button" class="invoice-type-option${invoiceType === 'company' ? ' active' : ''}" onclick="switchInvoiceType('${id}', 'company')"><strong>企业专票</strong><span>填写企业开票资料</span></button></div>`;
      const fields = invoiceType === 'company'
        ? `<div class="invoice-form-section"><div class="invoice-form-section-title">企业专票信息</div><div class="modal-tip">请填写企业名称和统一社会信用代码，其他资料按需填写。</div><div class="modal-form-grid">${invoiceField('invoiceCompanyName', '企业名称', { required: true, placeholder: '请输入企业名称' })}${invoiceField('invoiceTaxNo', '统一社会信用代码', { required: true, placeholder: '请输入统一社会信用代码' })}${invoiceField('invoiceCompanyAddress', '企业地址', { placeholder: '请输入企业地址' })}${invoiceField('invoiceCompanyPhone', '企业电话', { type: 'tel', placeholder: '请输入企业电话' })}${invoiceField('invoiceBankName', '开户银行', { placeholder: '请输入开户银行' })}${invoiceField('invoiceBankAccount', '银行账号', { placeholder: '请输入银行账号' })}</div></div>`
        : `<div class="invoice-form-section"><div class="invoice-form-section-title">个人发票信息</div><div class="modal-form-grid">${invoiceField('invoicePersonalTitle', '个人抬头', { required: true, value: data.owner, placeholder: '请输入个人抬头' })}${invoiceField('invoicePersonalPhone', '联系手机号', { required: true, type: 'tel', value: data.phone, placeholder: '请输入联系手机号' })}</div></div>`;
      return `<div class="invoice-form-section"><div class="invoice-form-section-title">发票类型</div>${typeOptions}</div>${fields}`;
    }
    function setInvoiceModalAction(id, mode) {
      const confirmButton = document.getElementById('modalConfirmButton');
      if (!confirmButton) return;
      confirmButton.textContent = mode === 'ticket' ? '提交票据申请' : '提交开票申请';
      confirmButton.onclick = () => submitOrderInvoice(id, mode);
    }
    function switchInvoiceType(id, invoiceType) {
      const root = document.querySelector('.invoice-application');
      const data = invoiceOrderData(id);
      if (!root || !data) return;
      root.dataset.invoiceType = invoiceType;
      const body = document.getElementById('invoiceFormBody');
      if (body) body.innerHTML = invoiceApplicationForm(id, root.dataset.mode || 'invoice', invoiceType, data);
    }
    function openOrderInvoice(id) {
      const data = invoiceOrderData(id);
      if (!data) return;
      const modalTitle = data.mode === 'ticket' ? '开票据' : '开发票';
      showModal(modalTitle, `<div class="invoice-application" data-order-id="${id}" data-mode="${data.mode}" data-invoice-type="personal"><div id="invoiceFormBody">${invoiceApplicationForm(id, data.mode, 'personal', data)}</div></div>`);
      const modal = document.querySelector('#modalMask .modal');
      if (modal) modal.classList.add('invoice-application-modal');
      setInvoiceModalAction(id, data.mode);
    }
    function setInvoiceFieldError(id, message) {
      const field = document.getElementById(id);
      const error = document.getElementById(`${id}Error`);
      field?.closest('.modal-form-field')?.classList.toggle('has-error', Boolean(message));
      if (error) error.textContent = message || '';
    }
    function submitOrderInvoice(id, mode) {
      const root = document.querySelector('.invoice-application');
      const invoiceType = root?.dataset.invoiceType || 'personal';
      document.querySelectorAll('.invoice-application .modal-field-error').forEach(error => { error.textContent = ''; });
      document.querySelectorAll('.invoice-application .modal-form-field').forEach(field => field.classList.remove('has-error'));
      const fields = mode === 'ticket'
        ? []
        : invoiceType === 'company'
          ? [['invoiceCompanyName', '请输入企业名称'], ['invoiceTaxNo', '请输入统一社会信用代码']]
          : [['invoicePersonalTitle', '请输入个人抬头'], ['invoicePersonalPhone', '请输入联系手机号']];
      const missing = fields.find(([fieldId]) => !document.getElementById(fieldId)?.value.trim());
      if (missing) {
        setInvoiceFieldError(missing[0], missing[1]);
        document.getElementById(missing[0])?.focus();
        return;
      }
      const data = invoiceOrderData(id);
      if (!data) return;
      const applicationNo = `${mode === 'ticket' ? 'NS' : 'FP'}20260914${String(Object.keys(orderInvoiceApplications).length + 1).padStart(4, '0')}`;
      const fieldValue = fieldId => document.getElementById(fieldId)?.value.trim() || '';
      orderInvoiceStatus[id] = '处理中';
      orderInvoiceApplications[id] = {
        id: applicationNo,
        orderNo: id,
        project: data.order[1],
        owner: data.owner,
        type: mode === 'ticket' ? '非税票据' : invoiceType === 'company' ? '企业专票' : '个人发票',
        credentialType: mode === 'ticket' ? '非税票据' : '增值税发票',
        amount: data.amount,
        status: '处理中',
        submittedAt: '2026-09-14 10:00',
        title: mode === 'ticket' ? data.owner : fieldValue(invoiceType === 'company' ? 'invoiceCompanyName' : 'invoicePersonalTitle'),
        phone: mode === 'ticket' ? data.phone : fieldValue(invoiceType === 'company' ? 'invoiceCompanyPhone' : 'invoicePersonalPhone'),
        taxNo: invoiceType === 'company' ? fieldValue('invoiceTaxNo') : '',
        address: invoiceType === 'company' ? fieldValue('invoiceCompanyAddress') : '',
        bankName: invoiceType === 'company' ? fieldValue('invoiceBankName') : '',
        bankAccount: invoiceType === 'company' ? fieldValue('invoiceBankAccount') : ''
      };
      hideModal();
      render();
      showModal('申请已提交', `${mode === 'ticket' ? '票据' : '发票'}申请已提交，处理结果将在财务管理中更新。`);
    }
    function showInvoiceApplication(id) {
      const application = orderInvoiceApplications[id];
      const type = application?.type || '开票申请';
      showModal('查看开票申请', `申请单 ${application?.id || '-'} · 订单 ${application?.orderNo || id}<br>${type} · 当前状态：${application?.status || '处理中'}<br>处理结果将在财务管理中更新。`);
    }
    let selectedOrderIds = new Set();
    function orderTable(rows) {
      const headers = [['', '44px'], ['订单号','180px'],['小区项目','190px'],['登记车牌','250px'],['订单状态','150px'],['通行状态','130px'],['金额','140px'],['操作','280px']];
      const tableRows = rows.length
        ? rows.map(r => `<tr><td class="table-checkbox-cell"><input class="order-checkbox" type="checkbox" data-order-id="${r[0]}" onchange="toggleOrderSelection('${r[0]}', this.checked)"></td>${r.map(c => `<td>${statusCell(c)}</td>`).join('')}<td><div class="table-actions">${orderActions(r)}</div></td></tr>`).join('')
        : `<tr><td colspan="${headers.length}"><div class="empty">暂无符合条件的数据</div></td></tr>`;
      return `<table><thead><tr><th class="table-checkbox-cell"><input class="order-checkbox" type="checkbox" aria-label="全选订单" onchange="toggleAllOrders(this.checked)"></th>${headers.slice(1).map(h => `<th style="width:${h[1] || 'auto'}">${h[0]}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table><div class="pager"><span>共 ${rows.length} 条</span><span class="page-box">‹</span><span class="page-box active">1</span><span class="page-box">2</span><span class="page-box">3</span><span class="page-box">›</span></div>`;
    }
    function filterOrders() {
      const keyword = document.getElementById('orderKeyword')?.value.trim().toLowerCase() || '';
      const type = document.getElementById('orderTypeFilter')?.dataset.value || '';
      const rows = orders.filter(order => {
        const values = [order[0], order[1], order[2], order[3], order[4]];
        return (!keyword || values.some(value => String(value).toLowerCase().includes(keyword))) && (!type || order[4] === type);
      }).map(r => [r[0], r[1], r[3], r[5], r[7], r[8]]);
      const tableWrap = document.getElementById('orderTable');
      if (tableWrap) tableWrap.innerHTML = orderTable(rows);
    }
    function resetOrderFilters() {
      const field = document.getElementById('orderKeyword');
      if (field) field.value = '';
      resetFilterDropdown('orderTypeFilter');
      filterOrders();
    }
    function toggleOrderSelection(id, checked) {
      if (checked) selectedOrderIds.add(id); else selectedOrderIds.delete(id);
    }
    function toggleAllOrders(checked) {
      document.querySelectorAll('.order-checkbox[data-order-id]').forEach(input => { input.checked = checked; if (checked) selectedOrderIds.add(input.dataset.orderId); else selectedOrderIds.delete(input.dataset.orderId); });
    }
    function revokeRefundApplication(orderNo) {
      const refund = refunds.find(item => item[1] === orderNo && item[7] === '待审批');
      if (!refund) return;
      showModal('撤销退款申请', `确认撤销订单 ${orderNo} 的退款申请吗？撤销后订单恢复为“月租有效”，可继续使用续费、开发票和退款功能。`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '确认撤销';
        confirmButton.onclick = () => {
          refund[7] = '已撤销';
          const order = orders.find(item => item[0] === orderNo);
          if (order) order[5] = '月租有效';
          hideModal();
          render();
          showModal('已撤销退款申请', `订单 ${orderNo} 已恢复为“月租有效”，现在可以继续办理开发票、续费或重新申请退款。`);
        };
      }
    }
    function renewalMoney(value) {
      const amount = Number(value);
      return Number.isFinite(amount) ? `¥${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '¥0.00';
    }
    function renewalPeriodDates(period) {
      const match = String(period || '').match(/(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/);
      if (!match) return null;
      const start = new Date(`${match[1]}T00:00:00`);
      const end = new Date(`${match[2]}T00:00:00`);
      return Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ? null : { start, end };
    }
    function renewalBaseMonths(period) {
      const dates = renewalPeriodDates(period);
      if (!dates) return 12;
      const days = Math.round((dates.end - dates.start) / 86400000) + 1;
      return Math.max(1, Math.round(days / 30.4375));
    }
    function renewalDateText(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    function renewalPeriodText(record, months) {
      const dates = renewalPeriodDates(record?.period);
      const start = dates ? new Date(dates.end) : new Date('2026-09-10T00:00:00');
      start.setDate(start.getDate() + (dates ? 1 : 0));
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      end.setDate(end.getDate() - 1);
      return `${renewalDateText(start)} 至 ${renewalDateText(end)}`;
    }
    function renewalAmount(order, record, months) {
      const originalAmount = Number(String(order?.[8] || record?.amount || '').replace(/[^\d.]/g, '')) || 0;
      return originalAmount / renewalBaseMonths(record?.period) * months;
    }
    function openRenewOrder(id) {
      const order = orders.find(item => item[0] === id);
      if (!order) return;
      const durationOptions = [1, 3, 6, 12].map(months => `<button type="button" class="select-option${months === 12 ? ' active' : ''}" data-value="${months}" onclick="selectFilterOption(event, 'renewalMonthsDropdown')">${months}个月</button>`).join('');
      const durationDropdown = `<div id="renewalMonthsDropdown" class="filter-dropdown" data-value="12"><button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleFilterDropdown(event, 'renewalMonthsDropdown')"><span>12个月</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="select-menu" role="listbox">${durationOptions}</div></div>`;
      showModal('续费', `<div class="modal-form-field"><label for="renewalMonthsDropdown">续费时间</label>${durationDropdown}<div id="renewalDurationError" class="modal-field-error"></div></div>`);
      const modal = document.querySelector('#modalMask .modal');
      if (modal) modal.classList.add('renew-order-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '确认续费'; confirmButton.onclick = () => submitRenewalOrder(id); }
    }
    function nextRenewalOrderNo() {
      const prefix = 'AS20260910';
      let sequence = orders.length + 1;
      let orderNo = `${prefix}${String(sequence).padStart(4, '0')}`;
      while (orders.some(order => order[0] === orderNo)) {
        sequence += 1;
        orderNo = `${prefix}${String(sequence).padStart(4, '0')}`;
      }
      return orderNo;
    }
    function submitRenewalOrder(id) {
      const months = Number(document.getElementById('renewalMonthsDropdown')?.dataset.value || 0);
      const error = document.getElementById('renewalDurationError');
      if (![1, 3, 6, 12].includes(months)) {
        if (error) error.textContent = '请选择续费时间';
        return;
      }
      const order = orders.find(item => item[0] === id);
      if (!order) return;
      const ownerUser = rentUsers.find(user => user.userId === order[9] || user.records.some(record => record.orderNo === id));
      const record = ownerUser?.records.find(item => item.orderNo === id);
      const plates = order[3] || record?.plates || '';
      const renewalNo = nextRenewalOrderNo();
      const renewalPeriod = renewalPeriodText(record, months);
      const renewalAmountValue = renewalAmount(order, record, months);
      const renewalAmountText = renewalMoney(renewalAmountValue);
      const createdAt = '2026-09-10 10:00';
      orders.unshift([renewalNo, order[1], order[2], plates, '续费', '月租待生效', '月租待生效', '已开通', renewalAmountText, order[9]]);
      originalOrderLinks[renewalNo] = id;
      if (ownerUser) {
        ownerUser.records.unshift({
          project: order[1], orderNo: renewalNo, type: '续费', plates, period: renewalPeriod,
          rentStatus: '月租待生效', trafficStatus: '已开通', amount: renewalAmountText, syncAt: createdAt, exception: '无'
        });
      }
      String(plates).split('、').filter(Boolean).forEach((plate, index) => {
        orderVehicleRelations.push({
          id: `OV${Date.now()}${index}`, orderId: renewalNo,
          vehicleId: ownerUser?.vehicles.find(vehicle => vehicle.plate === plate)?.id || `VEH-${ownerUser?.name || order[2]}-${plate}`,
          plateSnapshot: plate, sequence: index + 1, vehicleRole: index === 0 ? 'primary' : 'secondary',
          status: 'active', boundAt: createdAt, removedAt: null
        });
      });
      hideModal();
      render();
      showModal('续费订单已生成', `<div class="modal-tip">请在订单列表中点击“重新支付”，继续完成该续费订单的支付。</div><div class="renew-order-result"><div>续费订单 <strong>${renewalNo}</strong> 已生成。</div><div class="renew-order-result-time">续费时间：${months}个月</div></div>`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '完成'; confirmButton.onclick = hideModal; }
    }
    function refundForOrder(id, includeRejected = false) {
      const statuses = includeRejected ? ['待审批', '待用户确认', '已通过', '已驳回', '已撤销'] : ['待审批', '待用户确认', '已通过'];
      return refunds.find(item => item[1] === id && statuses.includes(item[7]));
    }
    const refundReasonOptions = ['不再使用月租', '车辆已更换', '搬离小区', '其他原因'];
    function selectRefundReason(event, reason) {
      event.stopPropagation();
      if (!refundReasonOptions.includes(reason)) return;
      const options = document.getElementById('refundReasonOptions');
      if (!options) return;
      options.dataset.value = reason;
      options.querySelectorAll('.refund-reason-option').forEach(option => {
        option.classList.toggle('active', option.dataset.value === reason);
      });
      const error = document.getElementById('refundReasonError');
      if (error) error.textContent = '';
    }
    function refundAccountText(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    }
    function refundAccountFormHtml() {
      const fields = [
        ['refundAccountName', '收款人', '请输入账户开户姓名或单位名称', 'text', 80],
        ['refundAccountBank', '开户行', '请输入银行及开户支行名称', 'text', 100],
        ['refundAccountNo', '收款账号', '请输入完整银行账号', 'text', 32],
        ['refundAccountPhone', '联系电话', '请输入11位手机号', 'tel', 11]
      ];
      return `<section class="refund-account-form"><h3 class="refund-application-label">退款账户信息</h3><div class="refund-account-grid">${fields.map(([id, label, placeholder, type, max]) => `<div class="refund-account-field"><label for="${id}">${label} <span class="refund-required">*</span></label><input id="${id}" class="form-control" type="${type}" maxlength="${max}" placeholder="${placeholder}" ${id === 'refundAccountNo' || id === 'refundAccountPhone' ? 'inputmode="numeric"' : ''} aria-describedby="${id}Error" aria-required="true"><div id="${id}Error" class="modal-field-error" aria-live="polite"></div></div>`).join('')}</div></section>`;
    }
    function readRefundAccountForm() {
      const fields = [
        ['refundAccountName', 'accountName', '请填写收款人'],
        ['refundAccountBank', 'bankName', '请填写开户行'],
        ['refundAccountNo', 'accountNo', '请填写收款账号'],
        ['refundAccountPhone', 'accountPhone', '请填写联系电话']
      ];
      const account = {};
      let firstInvalid = null;
      fields.forEach(([id, key, requiredMessage]) => {
        const field = document.getElementById(id);
        const error = document.getElementById(`${id}Error`);
        const value = (field?.value || '').trim();
        account[key] = key === 'accountNo' ? value.replace(/\s/g, '') : value;
        let message = value ? '' : requiredMessage;
        if (!message && key === 'accountName' && value.length > 80) message = '收款人最多80字';
        if (!message && key === 'bankName' && value.length > 100) message = '开户行最多100字';
        if (!message && key === 'accountNo' && !/^\d{8,30}$/.test(account[key])) message = '请输入8至30位数字银行账号';
        if (!message && key === 'accountPhone' && !/^1[3-9]\d{9}$/.test(value)) message = '请输入正确的11位手机号';
        if (error) error.textContent = message;
        field?.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (message && !firstInvalid) firstInvalid = field || { focus() {} };
      });
      if (firstInvalid) { firstInvalid.focus(); return null; }
      return account;
    }
    function openOrderRefund(id) {
      const existing = refundForOrder(id);
      if (existing) {
        showModal('不可重复申请退款', `订单 ${id} 已存在退款申请 ${existing[0]}，当前状态为“${existing[7]}”。同一订单不能重复提交退款申请，请先处理原退款单。`);
        return;
      }
      const order = orders.find(item => item[0] === id);
      const ownerUser = rentUsers.find(user => user.records.some(record => record.orderNo === id));
      const owner = ownerUser?.name || order?.[2] || '暂无用户';
      const plate = order?.[3] || ownerUser?.records.find(record => record.orderNo === id)?.plates || '暂无车辆';
      const amount = order?.[8] || '暂无金额';
      const reasonButtons = refundReasonOptions.map((reason, index) => `<button type="button" class="refund-reason-option${index === 0 ? ' active' : ''}" data-value="${reason}" onclick="selectRefundReason(event, '${reason}')">${reason}</button>`).join('');
      showModal('申请退款', `<div class="modal-tip">提交后状态为“待审批”，同一订单不能同时存在多笔待审批或已通过申请。</div><div class="approval-summary"><div class="approval-summary-title">退款信息</div><div class="approval-summary-grid"><div class="approval-summary-item"><span class="approval-summary-label">原订单号</span><span class="approval-summary-value">${id}</span></div><div class="approval-summary-item"><span class="approval-summary-label">申请用户</span><span class="approval-summary-value">${owner}</span></div><div class="approval-summary-item"><span class="approval-summary-label">退款车辆</span><span class="approval-summary-value">${plate}</span></div><div class="approval-summary-item"><span class="approval-summary-label">预计退款上限</span><span class="approval-summary-value">${amount}</span></div></div></div>${refundAccountFormHtml()}<div class="refund-application-field"><div class="refund-application-label">退款原因 <span class="refund-required">*</span></div><div id="refundReasonOptions" class="refund-reason-options" data-value="${refundReasonOptions[0]}">${reasonButtons}</div><div id="refundReasonError" class="modal-field-error"></div></div><div class="refund-application-note-field"><textarea id="refundApplyNote" class="form-control refund-application-note" aria-label="补充说明" maxlength="100" placeholder="补充说明（选填，最多100字）"></textarea><div id="refundNoteError" class="modal-field-error"></div></div>`);
      const modal = document.querySelector('#modalMask .modal');
      if (modal) modal.classList.add('refund-application-modal');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '提交申请';
        confirmButton.onclick = () => submitRefundApplication(id);
      }
    }
    function submitRefundApplication(orderNo) {
      const reasonOptions = document.getElementById('refundReasonOptions');
      const reasonError = document.getElementById('refundReasonError');
      const noteField = document.getElementById('refundApplyNote');
      const noteError = document.getElementById('refundNoteError');
      const noteContainer = document.querySelector('.refund-application-note-field');
      const reason = reasonOptions?.dataset.value || '';
      const note = noteField?.value.trim() || '';
      if (reasonError) reasonError.textContent = '';
      if (noteError) noteError.textContent = '';
      if (noteContainer) noteContainer.classList.remove('has-error');
      if (!reason) {
        if (reasonError) reasonError.textContent = '请选择退款原因';
        return;
      }
      if (note.length > 100) {
        if (noteError) noteError.textContent = '补充说明最多100字';
        if (noteContainer) noteContainer.classList.add('has-error');
        return;
      }
      const existing = refundForOrder(orderNo);
      if (existing) {
        if (reasonError) reasonError.textContent = `该订单已存在退款申请 ${existing[0]}，不能重复提交`;
        return;
      }
      const order = orders.find(item => item[0] === orderNo);
      const ownerUser = rentUsers.find(user => user.records.some(record => record.orderNo === orderNo));
      const record = ownerUser?.records.find(item => item.orderNo === orderNo);
      const refundAccount = readRefundAccountForm();
      if (!refundAccount) return;
      const refundNo = `RF20260904${String(refunds.length + 1).padStart(4, '0')}`;
      refunds.unshift([refundNo, orderNo, order?.[1] || record?.project || '暂无项目', ownerUser?.name || order?.[2] || '暂无用户', order?.[3] || record?.plates || '暂无车辆', `${refundAccount.accountName} / ${refundAccount.accountNo}`, order?.[8] || '¥0.00', '待审批', '通行已开通', reason, '2026-09-04 15:30', note, '', '', '', ownerUser?.userId || order?.[9] || null]);
      refundRequestDetails[refundNo] = {
        id: `REFUND-${refundNo}`, requestNo: refundNo, orderId: orderNo, userId: ownerUser?.userId || order?.[9] || null,
        reason, note: note || '未填写补充说明。', refundAccount: { ...refundAccount },
        originalPaidAmount: Number(String(order?.[8] || '0').replace(/[¥,]/g, '')) || 0,
        remainingTerm: record?.period || '以原订单月租周期为准',
        estimatedAmount: Number(String(order?.[8] || '0').replace(/[¥,]/g, '')) || 0,
        approvedAmount: null, status: '待审批', submittedAt: '2026-09-04 15:30', approvedAt: null, approverId: null, approvalNote: '等待退款审批。'
      };
      if (order) {
      order[7] = '已开通';
      }
      if (record) {
      record.trafficStatus = '已开通';
      }
      hideModal();
      render();
      showModal('退款申请已提交', `退款申请 ${refundNo} 已进入“待审批”，后续由后台完成退款审批。`);
    }
    function syncOrderTraffic(id) { showModal('同步通行权', `将向一路停车重新推送订单 ${id} 的车辆和月租有效期，并记录同步结果及操作日志。`); }
    const settlementRecords = [['AS202608280018','PAY202608280018','锦绣安置房','¥1,680.00','¥1,680.00','2026-08-29','已清分'],['AS202608280017','PAY202608280017','文庭商房','¥960.00','¥960.00','2026-08-29','清分处理中'],['AS202608280016','PAY202608280016','荣和家园','¥1,200.00','¥1,200.00','暂无清分时间','清分异常']];
    const manualSettlementRecords = {};
    function settlementActions(row) {
      return `<button class="btn-text" onclick="openSettlementDetail('${row[0]}')">详情</button>${row[6] === '清分异常' ? `<button class="btn-text" onclick="openManualSettlement('${row[0]}')">已清分</button>` : ''}`;
    }
    function openManualSettlement(orderNo) {
      const row = settlementRecords.find(item => item[0] === orderNo);
      if (!row || row[6] !== '清分异常') return;
      showModal('确认已清分', `<div class="modal-tip">本操作仅登记线下收款结果，不阻止线上分账。</div><div class="modal-order-summary">订单 ${orderNo}，清分金额 ${row[4]}。</div><div class="modal-form-field" style="margin-bottom:16px"><label for="manualSettlementDateTrigger">实际清分日期</label><div class="date-picker" data-datepicker-target="manualSettlementDate" data-datepicker-placeholder="请选择实际清分日期"><button type="button" id="manualSettlementDateTrigger" class="form-control date-picker-trigger" onclick="toggleDatePicker('manualSettlementDate')"><span class="date-picker-text is-placeholder">请选择实际清分日期</span><svg class="date-picker-icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 15h3"/></svg></button><input id="manualSettlementDate" type="hidden" value=""></div></div><div id="manualSettlementError" class="approval-error"></div>`);
      const confirm = document.getElementById('modalConfirmButton');
      if (confirm) {
        confirm.textContent = '确认已清分';
        confirm.onclick = () => {
          if (row[6] !== '清分异常') { hideModal(); return; }
          const dateField = document.getElementById('manualSettlementDate');
          const completedDate = dateField?.value || '';
          const now = new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(completedDate) || !dateField.checkValidity() || completedDate > today) {
            const error = document.getElementById('manualSettlementError');
            if (error) error.textContent = '请填写有效的实际清分日期，不能晚于今天';
            return;
          }
          const registeredAt = now.toLocaleString('zh-CN', { hour12: false });
          manualSettlementRecords[orderNo] = { previousStatus: row[6], completedDate, registeredAt, operator: currentLoginName || '管理员', method: '线下手动清分' };
          row[5] = completedDate;
          row[6] = '已清分';
          hideModal();
          render();
        };
      }
    }
    function openSettlementDetail(orderNo) { selectedSettlementOrder = orderNo; settlementSubpage = 'detail'; current = 'clearing'; render(); }
    function backToSettlements() { settlementSubpage = 'list'; selectedSettlementOrder = ''; current = 'clearing'; render(); }
    function settlementAllocation(row) {
      const garage = garages.find(item => item[0] === row[2]);
      const config = garage ? garageDetailConfig(garage) : { form: {}, feeItems: [] };
      const form = config.form || {};
      const defaults = garage && !garageConfigs[garage[0]] ? {
        monthlyReceiver: '安商房运营公司', monthlyMerchantId: 'MKT3301020001', monthlyBankAccount: '622288880010', monthlyResponsiblePhone: '0571-88990011',
        propertyReceiver: '锦绣物业服务有限公司', propertyMerchantId: 'MKT3301020038', propertyBankAccount: '622288880038', propertyResponsiblePhone: '0571-88990022'
      } : {};
      const fields = { ...defaults, ...form };
      const items = (config.feeItems || []).filter(item => Number(form[item.key]) > 0).map(item => {
        const prefix = item.key === 'monthlyAmount' ? 'monthly' : item.key === 'propertyAmount' ? 'property' : '';
        return {
          name: item.label || '未命名收费项', weight: Math.round(Number(form[item.key]) * 100),
          receiver: fields[item.receiverKey || `${prefix}Receiver`] || '未配置',
          merchant: fields[item.merchantKey || `${prefix}MerchantId`] || '未配置',
          account: fields[item.bankAccountKey || `${prefix}BankAccount`] || '未配置',
          owner: fields[item.responsibleKey || `${prefix}Responsible`] || '未配置',
          phone: fields[item.responsiblePhoneKey || `${prefix}ResponsiblePhone`] || '未配置'
        };
      });
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      const totalCents = Math.round(Number(String(row[4]).replace(/[^\d.]/g, '')) * 100) || 0;
      items.forEach(item => { item.cents = Math.floor(totalCents * item.weight / totalWeight); item.remainder = totalCents * item.weight % totalWeight; });
      let remaining = totalCents - items.reduce((sum, item) => sum + item.cents, 0);
      [...items].sort((a, b) => b.remainder - a.remainder).forEach(item => { if (remaining > 0) { item.cents += 1; remaining -= 1; } });
      return { garage, form, items, totalWeight, totalCents };
    }
    function settlementDetailPage() {
      const rows = settlementRecords;
      const row = rows.find(item => item[0] === selectedSettlementOrder) || rows[0];
      const status = row[6];
      const allocation = settlementAllocation(row);
      const { items, totalWeight, totalCents } = allocation;
      const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      const amount = cents => renewalMoney(cents / 100);
      const completed = status === '已清分';
      const detailRows = items.map(item => `<tr><td>${escape(item.name)}</td><td>${amount(item.weight)} / 月</td><td>${formatFeeSplit(item.weight, totalWeight)}</td><td class="settlement-amount">${amount(item.cents)}</td><td>${escape(item.receiver)}<small>${escape(item.merchant)}</small></td><td>${completed ? amount(item.cents) : '—'}</td><td>${tag(status)}</td></tr>`).join('');
      const accounts = items.map(item => `<div class="settlement-account"><h4>${escape(item.name)} · ${escape(item.receiver)}</h4><div class="detail-info-grid">${infoItem('商户编号', escape(item.merchant))}${infoItem('银行账号', escape(item.account))}${infoItem('负责人', escape(item.owner))}${infoItem('联系电话', escape(item.phone))}</div></div>`).join('');
      return `${innerPageHead('清分详情', 'backToSettlements()')}
        <section class="detail-page-section settlement-detail"><h3 class="detail-page-title">清分基本信息</h3><div class="detail-info-grid">${infoItem('业务订单号', row[0])}${infoItem('支付流水号', row[1])}${infoItem('小区项目', escape(row[2]))}${infoItem('清分状态', tag(status))}${infoItem('支付金额', row[3])}${infoItem('本次应分总额', amount(totalCents))}${infoItem('已清分金额', completed ? amount(totalCents) : '尚未确认')}${infoItem('清分完成日期', completed ? row[5] : '—')}${manualSettlementRecords[row[0]] ? `${infoItem('清分方式', '线下手动清分')}${infoItem('登记人', escape(manualSettlementRecords[row[0]].operator))}${infoItem('登记时间', escape(manualSettlementRecords[row[0]].registeredAt))}` : ''}</div></section>
        <section class="detail-page-section settlement-detail"><div class="settlement-section-head"><h3 class="detail-page-title">清分分配明细</h3><button class="btn-text" onclick="openGarageDetail(garages.find(item => item[0] === orders.find(order => order[0] === selectedSettlementOrder)?.[1])?.[0] || '')">查看项目配置</button></div>
          <div class="settlement-rule"><strong>按项目收费项金额占比分配</strong><div>收费项占比 = 该项月收费金额 ÷ 各项月收费合计；应分金额 = 本次应分总额 × 收费项占比。</div><div>${items.length ? `${items.map(item => `${escape(item.name)} ${amount(item.weight)}`).join(' + ')} = ${amount(totalWeight)} / 月` : '项目尚未配置有效收费金额，无法计算分配。'}</div></div>
          <div class="settlement-table-wrap"><table class="settlement-table"><thead><tr><th>收费项</th><th>配置收费标准</th><th>清分比例</th><th>本次应分金额</th><th>收款主体 / 商户编号</th><th>已清分金额</th><th>处理状态</th></tr></thead><tbody>${detailRows || '<tr><td colspan="7">暂无有效清分配置</td></tr>'}</tbody><tfoot><tr><td>合计</td><td>${amount(totalWeight)} / 月</td><td>${items.length ? '100.00%' : '—'}</td><td>${items.length ? amount(totalCents) : '—'}</td><td>共 ${items.length} 个收费项</td><td>${completed ? amount(totalCents) : '—'}</td><td>${completed ? tag('已全部清分', 'success') : tag(status)}</td></tr></tfoot></table></div>
          <p class="settlement-note">比例显示保留两位小数，计算使用未舍入比例；金额按分分配，尾差按小数余数从大到小补齐，确保明细合计等于应分总额。</p>
        </section>
        <section class="detail-page-section settlement-detail"><h3 class="detail-page-title">收款账户明细</h3>${accounts || '<div class="empty">暂无收款配置</div>'}</section>`;
    }
    function openOrder(id) {
      selectedOrderId = id;
      orderSubpage = 'detail';
      current = 'orders';
      render();
    }
    function orderInvoiceInfoHtml(order) {
      const application = orderInvoiceApplications[order[0]];
      const rows = invoiceRows().filter(item => item[1] === order[0]);
      const row = rows[0];
      const uploads = rows.filter(item => item[6] !== '已撤回').map(item => invoiceUploads[item[0]]).filter(Boolean);
      const hasApplication = Boolean(row || application);
      const issuedCount = rows.filter(item => invoiceIssued(item[6])).length;
      const issued = rows.length ? issuedCount === rows.length : invoiceIssued(orderInvoiceStatus[order[0]]);
      const status = issued ? '已开' : issuedCount ? '部分已开' : hasApplication || orderInvoiceStatus[order[0]] === '处理中' ? '未开' : '未申请';
      const totalAmount = rows.reduce((sum, item) => sum + Math.round(Number(String(item[5]).replace(/[^\d.]/g, '')) * 100), 0) / 100;
      const text = value => String(value || '暂无').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      const ticket = order[10] === '票据' || /票据/.test(String(application?.type || row?.[4] || ''));
      const noun = ticket ? '票据' : '发票';
      return `<section class="detail-page-section"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h3 class="detail-page-title" style="margin:0">${noun}信息</h3>${uploads.length ? `<button class="btn-text" onclick="openInvoiceFiles('${order[0]}')">查看${noun}</button>` : ''}</div><div class="detail-info-grid">
        ${infoItem('开票状态', tag(status, issued ? 'success' : status === '未开' ? 'warning' : 'gray'))}
        ${infoItem('开票记录编号', text(rows.map(item => item[0]).join('、')))}
        ${infoItem(`${noun}张数`, `${uploads.length} 张`)}
        ${infoItem(`${noun}类型`, text(application?.type || row?.[4]))}
        ${infoItem('开票抬头', text(application?.title || row?.[2]))}
        ${infoItem('开票金额合计', rows.length ? `¥${totalAmount.toFixed(2)}` : '暂无')}
        ${infoItem('统一社会信用代码', text(application?.taxNo))}
        ${infoItem('联系手机号', text(application?.phone))}
        ${infoItem('申请时间', text(application?.submittedAt || row?.[7]))}
        ${infoItem('上传时间', text(uploads.map(item => item.uploadedAt).join('、')))}
      </div></section>`;
    }
    function orderDetailPage() {
      const order = orders.find(item => item[0] === selectedOrderId) || orders[0];
      const [orderNo, project, owner, , orderType, orderStatus, , trafficStatus, , userId] = order;
      const ownerUser = rentUsers.find(user => user.userId === userId || user.records.some(record => record.orderNo === orderNo));
      const record = ownerUser?.records.find(item => item.orderNo === orderNo);
      const vehicleData = orderVehicleData(orderNo);
      const plates = vehicleData?.plates.length
        ? vehicleData.plates
        : String(order[3] || '').split('、').filter(Boolean);
      const refund = refundForOrder(orderNo, true);
      const originalOrder = originalOrderLinks[orderNo] || '无';
      return `${innerPageHead('订单详情', 'backToOrders()')}<section class="detail-page-section"><h3 class="detail-page-title">订单基本信息</h3><div class="detail-info-grid">${infoItem('订单号', `<strong>${orderNo}</strong>`)}${infoItem('所属项目', project)}${infoItem('申请用户', owner)}${infoItem('订单类型', tag(orderType))}${infoItem('订单状态', tag(orderStatus))}${infoItem('月租状态', tag(record?.rentStatus || '暂无状态'))}${infoItem('通行状态', tag(record?.trafficStatus || trafficStatus))}${infoItem('月租周期', record?.period || '暂无租期信息')}${infoItem('办理车辆', plates.length ? plates.join('、') : '暂无车辆')}</div></section>${orderInvoiceInfoHtml(order)}<section class="detail-page-section"><h3 class="detail-page-title">售后信息</h3><div class="detail-info-grid">${infoItem('退款状态', refund ? tag(refund[7]) : '未申请退款')}${infoItem('退款单号', refund ? refund[0] : '暂无退款单')}${infoItem('关联原订单', originalOrder)}</div></section>`;
    }
    function orderVehicleData(id) {
      const order = orders.find(item => item[0] === id);
      const ownerUser = rentUsers.find(user => user.userId === order?.[9] || user.records.some(item => item.orderNo === id));
      const record = ownerUser?.records.find(item => item.orderNo === id);
      if (!order) return null;
      const relations = orderVehicleRelations
        .filter(item => item.orderId === id && item.status === 'active')
        .sort((a, b) => a.sequence - b.sequence);
      return { order, ownerUser, record, relations, plates: relations.map(item => item.plateSnapshot) };
    }
    function validOrderPlate(value) {
      return /^[\u4e00-\u9fa5][A-Z][A-Z0-9挂学警港澳使领][A-Z0-9挂学警港澳使领]{4,5}$/.test(String(value || '').trim().toUpperCase());
    }
    function saveOrderVehicles(id, plates, previousPlate = '') {
      const data = orderVehicleData(id);
      if (!data) return;
      const now = '2026-09-09 15:30';
      const currentRelations = [...data.relations];
      currentRelations.forEach(relation => {
        if (!plates.includes(relation.plateSnapshot)) {
          relation.status = 'removed';
          relation.removedAt = now;
        }
      });
      plates.forEach((plate, index) => {
        const existing = currentRelations.find(relation => relation.status === 'active' && relation.plateSnapshot === plate);
        if (existing) {
          existing.sequence = index + 1;
          existing.vehicleRole = index === 0 ? 'primary' : 'secondary';
          return;
        }
        orderVehicleRelations.push({
          id: `OV${Date.now()}${index}`,
          orderId: id,
          vehicleId: data.ownerUser?.vehicles.find(vehicle => vehicle.plate === plate)?.id || `VEH-${data.ownerUser?.name || data.order[2]}-${plate}`,
          plateSnapshot: plate,
          sequence: index + 1,
          vehicleRole: index === 0 ? 'primary' : 'secondary',
          status: 'active',
          boundAt: now,
          removedAt: null
        });
      });
      data.order[3] = plates.join('、');
      data.order[7] = '已开通';
      if (data.record) data.record.plates = data.order[3];
      if (data.record) data.record.trafficStatus = '已开通';
      if (previousPlate && data.ownerUser) {
        const vehicle = data.ownerUser.vehicles.find(item => item.plate === previousPlate);
        const replacement = plates.find(plate => !data.plates.includes(plate));
        if (vehicle && replacement) vehicle.plate = replacement;
      } else if (data.ownerUser) {
        plates.forEach(plate => {
          if (!data.ownerUser.vehicles.some(vehicle => vehicle.plate === plate)) {
            const vehicleId = `VEH-${data.ownerUser.name || data.order[2]}-${plate}`;
            data.ownerUser.vehicles.push({ id: vehicleId, userId: data.ownerUser.userId, plate, color: '蓝牌', type: '小型车', status: '已绑定' });
          }
        });
      }
    }
    function openOrderVehicleManage(id) {
      const data = orderVehicleData(id);
      if (!data) return;
      const vehicleRows = data.plates.map(plate => {
        const canRemove = data.plates.length > 1;
        return `<div class="order-vehicle-manage-row"><span class="order-vehicle-plate">${plate}</span><div class="order-vehicle-actions"><button class="btn-text danger" type="button"${canRemove ? ` onclick="removeOrderVehicle('${id}', '${plate}')"` : ' disabled'}>移除</button><button class="btn-text" type="button" onclick="openChangeOrderVehicle('${id}', '${plate}')">变更</button></div></div>`;
      }).join('');
      const add = data.plates.length < 2 ? `<div class="order-vehicle-add"><button class="btn order-vehicle-add-btn" type="button" onclick="openAddOrderVehicle('${id}')"><span class="order-vehicle-add-icon">+</span><span>新增车辆</span></button></div>` : '';
      showModal('变更车辆', `<div class="modal-tip">一个订单最多绑定两辆车，且至少保留一辆车。</div><div class="order-vehicle-manage-list">${vehicleRows}</div>${add}`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.style.display = ''; confirmButton.textContent = '确认'; confirmButton.onclick = hideModal; }
    }
    function openAddOrderVehicle(id) {
      const data = orderVehicleData(id);
      if (!data || data.plates.length >= 2) {
        showModal('无法新增车辆', '一张月租订单最多绑定两辆车。');
        return;
      }
      showModal('新增车辆', `<div class="modal-tip">新增后将更新月租车辆，并向一路停车同步车辆通行权限。</div><div class="modal-form-field"><label for="orderNewPlate">车牌号</label><input id="orderNewPlate" class="form-control" placeholder="请输入完整车牌号"><div id="orderVehicleError" class="modal-field-error"></div></div>`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '保存并同步'; confirmButton.onclick = () => { const plate = document.getElementById('orderNewPlate')?.value.trim().toUpperCase() || ''; const error = document.getElementById('orderVehicleError'); if (!validOrderPlate(plate)) { if (error) error.textContent = '请输入正确的车牌号'; return; } if (data.plates.includes(plate)) { if (error) error.textContent = '该车辆已在订单中'; return; } saveOrderVehicles(id, [...data.plates, plate]); hideModal(); render(); showModal('车辆已新增', `车辆 ${plate} 已新增，系统将同步更新一路停车通行权限。`); }; }
    }
    function openChangeOrderVehicle(id, plate) {
      const data = orderVehicleData(id);
      if (!data || !plate || !data.plates.includes(plate)) return;
      showModal('变更车辆', `<div class="modal-tip">变更后原车辆取消该订单通行权限，新车辆继承剩余月租权益。</div><div class="modal-form-field"><label>当前车牌号</label><div class="order-vehicle-current">${plate}</div></div><div class="modal-form-field"><label for="orderChangeTo">新车牌号</label><input id="orderChangeTo" class="form-control" placeholder="请输入完整车牌号"><div id="orderVehicleError" class="modal-field-error"></div></div>`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '保存并同步'; confirmButton.onclick = () => { const to = document.getElementById('orderChangeTo')?.value.trim().toUpperCase() || ''; const error = document.getElementById('orderVehicleError'); if (!validOrderPlate(to)) { if (error) error.textContent = '请输入正确的车牌号'; return; } if (data.plates.includes(to)) { if (error) error.textContent = '该车辆已在订单中'; return; } saveOrderVehicles(id, data.plates.map(item => item === plate ? to : item), plate); hideModal(); render(); showModal('车辆已变更', `${plate} 已变更为 ${to}，系统将同步更新一路停车通行权限。`); }; }
    }
    function removeOrderVehicle(id, plate) {
      const data = orderVehicleData(id);
      if (!data || data.plates.length < 2) {
        showModal('无法移除车辆', '当前订单只有一辆办理车辆，不能移除。');
        return;
      }
      if (!data.plates.includes(plate)) return;
      showModal('移除车辆', `确认移除车辆 ${plate} 吗？移除后该车辆不再享受此订单的月租通行权益。`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '确认移除并同步'; confirmButton.onclick = () => { saveOrderVehicles(id, data.plates.filter(item => item !== plate)); hideModal(); render(); showModal('车辆已移除', `车辆 ${plate} 已移除，系统将同步撤销该车辆的月租通行权限。`); }; }
    }
