    function refundDetailPage() {
      const refund = refunds.find(item => item[0] === selectedRefundId) || refunds[0];
      const [refundNo, orderNo, project, owner, plate, account, amount, status, trafficStatus, reason, submittedAt] = refund;
      const detail = refundRequestDetails[refundNo] || {
        id: `REFUND-${refundNo}`,
        requestNo: refundNo,
        orderId: orderNo,
        userId: refund[16] || null,
        submittedAt,
        reason,
        note: '后台提交退款申请，具体材料以原订单和申请记录为准。',
        remainingTerm: '以原订单月租周期为准',
        originalPaidAmount: Number(String(amount).replace(/[¥,]/g, '')) || 0,
        estimatedAmount: Number(String(amount).replace(/[¥,]/g, '')) || 0,
        approvedAmount: null,
        status: status === '待审批' ? '待审批' : status === '已驳回' ? '已驳回' : '已通过',
        approvedAt: null,
        approverId: null,
        approvalNote: '等待退款审批。'
      };
      const refundAccount = detail.refundAccount || {
        accountName: account.split(' / ')[0], accountNo: account.split(' / ')[1] || '未记录',
        bankName: '未记录', accountPhone: '未记录'
      };
      const approvalRecord = refundAuditRecords[refundNo];
      const approvalResult = status;
      const pendingConfirmation = status === '待用户确认';
      const approvalNote = detail.approvalNote || approvalRecord?.note;
      const trafficNote = pendingConfirmation ? '等待用户确认核定金额，订单及通行状态保持不变，尚未发起退款。' : status === '已通过'
        ? '退款审批通过，月租订单已终止，通行权限已结束。'
        : status === '已驳回'
          ? '退款申请已驳回，原月租通行已恢复。'
          : '退款申请提交后，原月租和通行状态暂不变化，审批通过后再按结果处理。';
      return `${innerPageHead('退款详情', 'backToRefundList()')}<section class="detail-page-section"><h3 class="detail-page-title">退款申请</h3><div class="detail-info-grid">${infoItem('退款申请 ID', detail.id)}${infoItem('申请编号', detail.requestNo)}${infoItem('退款状态', tag(status))}${infoItem('原订单号', orderNo)}${infoItem('申请用户', owner)}${infoItem('退款车辆', plate)}${infoItem('预计退款金额', money(`¥${Number(detail.estimatedAmount).toFixed(2)}`))}${infoItem('提交时间', detail.submittedAt)}${infoItem('退款原因', detail.reason)}${infoItem('补充说明', detail.note)}</div></section><section class="detail-page-section"><h3 class="detail-page-title">退款账户信息</h3><div class="detail-info-grid">${infoItem('原月租周期', detail.remainingTerm)}${infoItem('原支付金额', money(`¥${Number(detail.originalPaidAmount).toFixed(2)}`))}${infoItem('收款人', refundAccountText(refundAccount.accountName))}${infoItem('开户行', refundAccountText(refundAccount.bankName))}${infoItem('收款账号', refundAccountText(refundAccount.accountNo))}${infoItem('联系电话', refundAccountText(refundAccount.accountPhone))}</div></section>${status === '待审批' ? '' : `<section class="detail-page-section"><h3 class="detail-page-title">审批情况</h3><div class="detail-info-grid">${infoItem('审批结果', tag(approvalResult))}${infoItem('核定退款金额', detail.approvedAmount == null ? '待审批' : money(`¥${Number(detail.approvedAmount).toFixed(2)}`))}${infoItem('审批人 ID', detail.approverId || '待审批')}${infoItem('审批时间', detail.approvedAt || '待审批')}${infoItem('审批意见', refundAccountText(approvalNote || '未记录'))}${detail.adjustmentReason ? infoItem('金额调整原因', refundAccountText(detail.adjustmentReason)) : ''}${detail.userConfirmationStatus ? infoItem('用户确认', tag(detail.userConfirmationStatus)) : ''}${detail.notificationStatus ? infoItem('通知状态', detail.notificationStatus) : ''}${detail.refundExecutionStatus ? infoItem('退款执行状态', tag(detail.refundExecutionStatus)) : ''}${infoItem('通行处理', tag(trafficStatus))}${infoItem('通行处理说明', trafficNote)}</div></section>`}`;
    }
    function refundTableHtml(records) {
      const headers = [['退款单号','140px'],['原订单号','150px'],['小区项目','130px'],['退款车辆','120px'],['退款原因','180px'],['预计退款','100px'],['核定退款','100px'],['申请时间','150px'],['状态','100px'],['操作','160px']];
      const tableRows = records.length
        ? records.map(refund => {
            const row = [refund[0], refund[1], refund[2], refund[4], `__html__<span class="table-cell-ellipsis" title="${refund[9]}">${refund[9]}</span>`, refund[6], refundRequestDetails[refund[0]]?.approvedAmount == null ? '暂无' : `¥${Number(refundRequestDetails[refund[0]].approvedAmount).toFixed(2)}`, refund[10], refund[7]];
            return `<tr>${row.map(c => `<td>${statusCell(c)}</td>`).join('')}<td><div class="table-actions">${refundActions(refund)}</div></td></tr>`;
          }).join('')
        : `<tr><td colspan="${headers.length}"><div class="empty">暂无符合条件的数据</div></td></tr>`;
      return `<table><thead><tr>${headers.map(h => `<th style="width:${h[1] || 'auto'}">${h[0]}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table><div class="pager"><span>共 ${records.length} 条</span><span class="page-box">‹</span><span class="page-box active">1</span><span class="page-box">2</span><span class="page-box">3</span><span class="page-box">›</span></div>`;
    }
    function filteredRefundRecords() {
      const keyword = document.getElementById('refundKeyword')?.value.trim().toLowerCase() || '';
      const status = document.getElementById('refundStatusFilter')?.dataset.value || '';
      return refunds.filter(refund => {
        const values = [refund[0], refund[1], refund[2], refund[3], refund[4], refund[9]];
        return (!keyword || values.some(value => String(value).toLowerCase().includes(keyword))) && (!status || refund[7] === status);
      });
    }
    function filterRefunds() {
      const tableWrap = document.getElementById('refundTable');
      if (tableWrap) tableWrap.innerHTML = refundTableHtml(filteredRefundRecords());
    }
    function resetRefundFilters() {
      const keyword = document.getElementById('refundKeyword');
      if (keyword) keyword.value = '';
      resetFilterDropdown('refundStatusFilter');
      filterRefunds();
    }
    function refundActions(refund) {
      const status = refund[7];
      const actions = [`<button class="btn-text" onclick="openRefund('${refund[0]}')">详情</button>`];
      if (status === '待审批') actions.push(`<button class="btn-text" onclick="openRefundApproval('${refund[0]}')">审批</button>`);
      return actions.join('');
    }
    function refundAmountCents(value) {
      const text = String(value ?? '').replace(/[¥￥,\s]/g, '');
      if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
      const parts = text.split('.');
      const cents = Number(parts[0]) * 100 + Number((parts[1] || '').padEnd(2, '0'));
      return Number.isSafeInteger(cents) ? cents : null;
    }
    function refundAmountLimits(refund) {
      const detail = refundRequestDetails[refund[0]] || {};
      const order = orders.find(item => item[0] === refund[1]);
      return {
        estimated: refundAmountCents(detail.estimatedAmount ?? refund[6]),
        maximum: refundAmountCents(detail.originalPaidAmount ?? order?.[8])
      };
    }
    function refundAmountEditor(refund) {
      const { estimated, maximum } = refundAmountLimits(refund);
      return `<section class="refund-amount-editor"><button id="refundAmountToggle" type="button" class="btn-text" aria-expanded="false" aria-controls="refundAmountFields" onclick="toggleRefundAmountEditor('${refund[0]}')">修改退款金额</button><div id="refundAmountFields" hidden><div class="refund-approval-field-row"><label for="refundApprovedAmount">修改退款金额（元） <span class="refund-required">*</span></label><input id="refundApprovedAmount" class="form-control" inputmode="decimal" value="${estimated == null ? '' : (estimated / 100).toFixed(2)}" oninput="updateRefundAmountHint('${refund[0]}')" aria-describedby="refundAmountError"></div><div class="create-help">原支付金额：${maximum == null ? '未记录，请先核实' : '¥' + (maximum / 100).toFixed(2)}</div><div class="refund-approval-field-row refund-adjustment-reason-field"><label for="refundAdjustmentReason">金额调整原因</label><textarea id="refundAdjustmentReason" class="form-control approval-reject-control" maxlength="200" placeholder="修改金额后必填，请说明调整依据"></textarea></div></div><div id="refundAmountError" class="approval-error" aria-live="polite"></div><div id="refundAdjustmentError" class="approval-error" aria-live="polite"></div><div id="refundAmountHint" class="create-help"></div></section>`;
    }
    function toggleRefundAmountEditor(id) {
      const fields = document.getElementById('refundAmountFields');
      const toggle = document.getElementById('refundAmountToggle');
      const refund = refunds.find(item => item[0] === id);
      if (!fields || !toggle || !refund) return;
      const opening = fields.hidden;
      fields.hidden = !opening;
      toggle.textContent = opening ? '取消修改金额' : '修改退款金额';
      toggle.setAttribute('aria-expanded', String(opening));
      const input = document.getElementById('refundApprovedAmount');
      if (opening) input?.focus();
      else {
        const estimated = refundAmountLimits(refund).estimated;
        if (input) input.value = estimated == null ? '' : (estimated / 100).toFixed(2);
        document.getElementById('refundAdjustmentReason').value = '';
        document.getElementById('refundAmountError').textContent = '';
        document.getElementById('refundAdjustmentError').textContent = '';
      }
      updateRefundAmountHint(id);
    }
    function updateRefundAmountHint(id) {
      const refund = refunds.find(item => item[0] === id);
      if (!refund) return;
      const cents = refundAmountCents(document.getElementById('refundApprovedAmount')?.value);
      const estimated = refundAmountLimits(refund).estimated;
      const changed = cents != null && estimated != null && cents !== estimated;
      const reduced = changed && cents < estimated;
      const hint = document.getElementById('refundAmountHint');
      if (hint) hint.textContent = reduced ? '金额调低后进入待用户确认，确认前不终止订单、不执行退款。' : '审批通过后进入待退款处理，审批通过不代表已到账。';
      const button = document.getElementById('modalConfirmButton');
      if (button) button.textContent = changed ? '提交' : '通过';
    }
    function openRefundApproval(id) {
      const refund = refunds.find(item => item[0] === id);
      if (!refund || refund[7] !== '待审批') return;
      const [refundNo, orderNo, project, owner, plate, , amount, , , reason, submittedAt] = refund;
      showModal('退款审批', `<div class="approval-summary"><div class="approval-summary-title">请确认这笔退款申请</div><div class="approval-summary-grid"><div class="approval-summary-item"><span class="approval-summary-label">退款单号</span><span class="approval-summary-value">${refundNo}</span></div><div class="approval-summary-item"><span class="approval-summary-label">原订单号</span><span class="approval-summary-value">${orderNo}</span></div><div class="approval-summary-item"><span class="approval-summary-label">申请用户</span><span class="approval-summary-value">${owner}</span></div><div class="approval-summary-item"><span class="approval-summary-label">小区项目</span><span class="approval-summary-value">${project}</span></div><div class="approval-summary-item"><span class="approval-summary-label">退款车辆</span><span class="approval-summary-value">${plate}</span></div><div class="approval-summary-item"><span class="approval-summary-label">预计退款</span><span class="approval-summary-value">${money(amount)}</span></div><div class="approval-summary-item"><span class="approval-summary-label">申请时间</span><span class="approval-summary-value">${submittedAt}</span></div><div class="approval-summary-item"><span class="approval-summary-label">退款原因</span><span class="approval-summary-value">${reason}</span></div></div></div>${refundAmountEditor(refund)}<label class="approval-reject-label" for="refundRejectReason">驳回原因</label><textarea id="refundRejectReason" class="form-control approval-reject-control" placeholder="如选择驳回，请填写具体原因"></textarea><div id="refundRejectError" class="approval-error"></div>`);
      document.querySelector('#modalMask .modal')?.classList.add('refund-approval-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      cancelButton.textContent = '取消';
      cancelButton.className = 'btn';
      cancelButton.onclick = hideModal;
      const rejectButton = document.getElementById('modalRejectButton');
      rejectButton.style.display = '';
      rejectButton.onclick = () => rejectRefund(id);
      confirmButton.textContent = '通过';
      confirmButton.className = 'btn btn-primary';
      confirmButton.onclick = () => approveRefund(id);
      updateRefundAmountHint(id);
    }
    function approveRefund(id) {
      const refund = refunds.find(item => item[0] === id);
      if (!refund || refund[7] !== '待审批') return;
      const input = document.getElementById('refundApprovedAmount');
      const amountError = document.getElementById('refundAmountError');
      const reasonError = document.getElementById('refundAdjustmentError');
      const raw = input?.value.trim() || '';
      const cents = /^\d+(\.\d{1,2})?$/.test(raw) ? refundAmountCents(raw) : null;
      const { estimated, maximum } = refundAmountLimits(refund);
      const adjustmentReason = document.getElementById('refundAdjustmentReason')?.value.trim() || '';
      if (amountError) amountError.textContent = '';
      if (reasonError) reasonError.textContent = '';
      let error = cents == null || cents <= 0 ? '请输入大于0且最多两位小数的退款金额' : maximum == null || estimated == null ? '原支付或预计退款金额缺失，请先核实' : cents > maximum ? '退款金额不能超过原支付金额' : '';
      if (error) { if (amountError) amountError.textContent = error; input?.focus(); return; }
      if ((cents !== estimated && !adjustmentReason) || adjustmentReason.length > 200) {
        if (reasonError) reasonError.textContent = adjustmentReason.length > 200 ? '调整原因最多200字' : '修改退款金额后请填写调整原因';
        return;
      }
      const detail = refundRequestDetails[id] || (refundRequestDetails[id] = {
        id: `REFUND-${id}`, requestNo: id, orderId: refund[1], submittedAt: refund[10],
        reason: refund[9], note: refund[11] || '', remainingTerm: '以原订单月租周期为准',
        originalPaidAmount: maximum / 100, estimatedAmount: estimated / 100
      });
      const reduced = cents < estimated;
      const processedAt = new Date().toLocaleString('zh-CN', { hour12: false });
      const nextStatus = '待用户确认';
      const approvalNote = adjustmentReason ? `金额调整原因：${adjustmentReason}` : '退款审批已通过，等待用户在小程序端确认。';
      Object.assign(detail, {
        status: nextStatus, approvedAmount: cents / 100, adjustmentReason,
        approvedAt: processedAt, approverId: currentLoginName, approvalNote,
        userConfirmationStatus: '待确认',
        notificationStatus: '待接入小程序通知', refundExecutionStatus: '未发起'
      });
      refund[7] = nextStatus;
      refundAuditRecords[id] = { result: nextStatus, note: approvalNote, operator: currentLoginName, time: processedAt, originalAmount: estimated / 100, approvedAmount: cents / 100 };
      hideModal();
      render();
      showModal('核定结果已保存', `该申请已进入"待用户确认"${reduced ? '（金额已调整）' : ''}，订单及通行状态保持不变。用户在小程序确认后方可退款。`);
    }
    function rejectRefund(id) {
      const reasonField = document.getElementById('refundRejectReason');
      const error = document.getElementById('refundRejectError');
      const reason = reasonField?.value.trim() || '';
      if (!reason) {
        if (error) error.textContent = '请输入驳回原因';
        if (reasonField) reasonField.classList.add('has-error');
        return;
      }
      const refund = refunds.find(item => item[0] === id);
      if (!refund || refund[7] !== '待审批') return;
      const detail = refundRequestDetails[id];
      if (detail) {
        detail.status = '已驳回';
        detail.approvedAmount = null;
        detail.approvedAt = '2026-09-09 15:30';
        detail.approverId = currentLoginName;
        detail.approvalNote = reason;
      }
      refund[7] = '已驳回';
      refund[8] = '通行已恢复';
      const order = orders.find(item => item[0] === refund[1]);
      if (order) {
        order[5] = '月租有效';
        order[7] = '已开通';
      }
      rentUsers.forEach(user => user.records.filter(record => record.orderNo === refund[1]).forEach(record => { record.trafficStatus = '已恢复'; }));
      refundAuditRecords[id] = { result: '驳回', note: reason };
      hideModal();
      render();
      showModal('退款申请已驳回', '已记录驳回原因，原月租通行保持恢复状态。');
    }
    function backToRefundList() {
      refundSubpage = 'list';
      selectedRefundId = '';
      current = 'refunds';
      render();
    }
    function openRefund(id) {
      selectedRefundId = id;
      refundSubpage = 'detail';
      current = 'refunds';
      render();
    }
