    function userRentStatus(records) {
      if (!records?.length) return '未办理';
      if (records.some(record => record.rentStatus === '月租有效')) return '月租有效';
      if (records.some(record => record.rentStatus === '月租待生效')) return '月租待生效';
      if (records.some(record => record.rentStatus === '退款处理中')) return '退款处理中';
      if (records.some(record => record.rentStatus === '月租已过期')) return '月租已过期';
      return records[0].rentStatus || '未办理';
    }

    function userTableHtml(records) {
      const rows = records.map(user => {
        const latest = user.records.length ? user.updatedAt.slice(0, 10) : '暂无办理时间';
        const orderSummary = user.records.length ? `${user.records.length} 个订单` : '<span class="user-empty">暂无办理订单</span>';
        return [
          `__html__<div class="user-cell"><span class="user-cell-avatar">${user.name.slice(0, 1)}</span><div class="user-cell-copy"><div class="user-cell-name">${user.name}</div></div></div>`,
          `__html__<span class="user-vehicle">${user.vehicles[0]?.plate || '暂无绑定车辆'}</span>${user.vehicles.length > 1 ? `<span class="user-vehicle-more">等 ${user.vehicles.length} 辆</span>` : ''}`,
          `__html__${orderSummary}`,
          `__html__${tag(userRentStatus(user.records))}`,
          latest
        ];
      });
      return table([['用户','190px'],['绑定车辆','190px'],['办理订单','150px'],['月租状态','190px'],['最近办理时间','150px'],['操作','100px']], rows, (r, index) => `<button class="btn-text" onclick="openUser('${records[index].name}')">详情</button>`);
    }
    function filterUsers() {
      const keyword = document.getElementById('userKeyword')?.value.trim().toLowerCase() || '';
      const status = document.getElementById('userStatusFilter')?.dataset.value || '';
      const records = rentUsers.filter(user => {
        const values = [user.name, user.phone, user.idCard, ...user.vehicles.map(vehicle => vehicle.plate)];
        const keywordMatches = !keyword || values.some(value => String(value).toLowerCase().includes(keyword));
        const rentMatches = !status || userRentStatus(user.records) === status;
        return keywordMatches && rentMatches;
      });
      const tableWrap = document.getElementById('userTable');
      if (tableWrap) tableWrap.innerHTML = userTableHtml(records);
    }
    function resetUserFilters() {
      const keyword = document.getElementById('userKeyword');
      if (keyword) keyword.value = '';
      resetFilterDropdown('userStatusFilter');
      filterUsers();
    }
    function openUser(name) {
      selectedUserName = name;
      userSubpage = 'detail';
      current = 'users';
      render();
    }
    function userSensitiveInfo(user) {
      const revealed = revealedSensitiveUsers.has(user.userId);
      const virtualInfo = {
        'USR-王敏-001': { phone: '13800002028', idCard: '330102199203184521', accountNo: '6217000000002028', accountPhone: '13800002028' },
        'USR-陈涛-002': { phone: '13900008841', idCard: '330106199108121108' },
        'USR-林静-003': { phone: '13600007209', idCard: '330104199506120927', accountNo: '6214000000007209', accountPhone: '13600007209' },
        'USR-周伟-004': { phone: '13500006610', idCard: '330102198907156730', accountNo: '6212000000006610', accountPhone: '13500006610' },
        'USR-赵宁-005': { phone: '13700005142', idCard: '330105199412103614' },
        'USR-何悦-006': { phone: '13600009234', idCard: '330103199608082345' },
        'USR-杜飞-007': { phone: '13700001096', idCard: '330104199211064567' }
      }[user.userId] || {};
      return revealed ? { phone: virtualInfo.phone || user.phone, idCard: virtualInfo.idCard || user.idCard, accountNo: virtualInfo.accountNo || user.refundAccount?.accountNo, accountPhone: virtualInfo.accountPhone || user.refundAccount?.accountPhone } : { phone: user.phone, idCard: user.idCard, accountNo: user.refundAccount?.accountNo, accountPhone: user.refundAccount?.accountPhone };
    }
    function revealUserSensitiveInfo(userId) {
      if (currentAccountType !== '超级管理员') return;
      revealedSensitiveUsers.add(userId);
      sensitiveInfoAuditLogs.push({ operator: currentLoginName === 'admin' ? '超级管理员' : currentLoginName, userId, action: '查看用户完整信息', time: new Date().toLocaleString('zh-CN', { hour12: false }) });
      render();
    }
    function hideUserSensitiveInfo(userId) {
      revealedSensitiveUsers.delete(userId);
      render();
    }
    let previewReturnVehicleId = '';
    function openVehicleDetail(vehicleId) {
      const owner = rentUsers.find(user => user.vehicles.some(vehicle => vehicle.id === vehicleId));
      const vehicle = owner?.vehicles.find(item => item.id === vehicleId);
      if (!vehicle) return;
      previewReturnVehicleId = vehicleId;
      const plateColorText = { '蓝牌': '蓝色车牌', '新能源': '绿色车牌' }[vehicle.color] || vehicle.color || '未填写';
      const photos = Number(vehicle.photos) || 0;
      const photoNames = Array.from({ length: photos }, (_, index) => `车辆照片${index + 1}.jpg`);
      const photoItems = photos
        ? photoNames.map(name => `<div class="vehicle-photo-row"><span class="vehicle-photo-thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M4 17l4.5-4.5L12 16l3-3 5 5"></path></svg></span><span class="vehicle-photo-name">${name}</span><button class="btn-text" onclick="previewVehiclePhoto('${name}')">查看</button></div>`).join('')
        : '<div class="vehicle-photo-empty">该车辆未上传照片</div>';
      const body = `<div class="detail-info-grid vehicle-detail-grid">${infoItem('车牌号', vehicle.plate)}${infoItem('车牌颜色', plateColorText)}${infoItem('车辆大小类型', vehicle.type || '未填写')}${infoItem('车辆外观颜色', vehicle.appearance || '未填写')}${infoItem('所属用户', owner.name)}${infoItem('绑定状态', tag(vehicle.status))}</div><div class="vehicle-detail-photos-wrap"><div class="vehicle-detail-subtitle">车辆照片（${photos} 张）</div><div class="vehicle-detail-photos">${photoItems}</div></div>`;
      showModal('车辆信息', body);
      const modal = document.querySelector('#modalMask .modal');
      if (modal) modal.classList.add('vehicle-detail-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      if (cancelButton) cancelButton.style.display = 'none';
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '关闭'; confirmButton.onclick = hideModal; }
    }
    function previewVehiclePhoto(name) {
      showModal(name, '<div class="vehicle-photo-preview"><span class="vehicle-photo-preview-tip">图片预览</span></div>');
      const modal = document.querySelector('#modalMask .modal');
      if (modal) modal.classList.add('vehicle-photo-preview-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      if (cancelButton) cancelButton.style.display = 'none';
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '返回'; confirmButton.onclick = () => openVehicleDetail(previewReturnVehicleId); }
    }
    function userDetailPage() {
      const user = rentUsers.find(item => item.name === selectedUserName) || rentUsers[0];
      const sensitive = userSensitiveInfo(user);
      const revealed = revealedSensitiveUsers.has(user.userId);
      const revealAction = currentAccountType === '超级管理员' ? `<button class="btn-text sensitive-reveal" onclick="${revealed ? 'hideUserSensitiveInfo' : 'revealUserSensitiveInfo'}('${user.userId}')">${revealed ? '收起' : '查看完整信息'}</button>` : '';
      const vehicles = user.vehicles.length
        ? user.vehicles.map(vehicle => `<div class="user-detail-vehicle">${detailFeeField('车牌号', vehicle.plate)}${detailFeeField('车辆信息', `${vehicle.color} · ${vehicle.type}`)}${detailFeeField('绑定状态', tag(vehicle.status))}<div class="detail-fee-field user-vehicle-action"><div class="detail-fee-label">&nbsp;</div><div class="detail-fee-value"><button class="btn-text" onclick="openVehicleDetail('${vehicle.id}')">查看</button></div></div></div>`).join('')
        : '<div class="user-detail-empty">暂无绑定车辆</div>';
      const rentRecords = user.records.length
        ? `<table class="user-rent-record-table"><thead><tr><th style="width:160px">订单号</th><th style="width:140px">小区项目</th><th style="width:190px">办理车辆</th><th style="width:250px">租期</th><th style="width:120px">月租状态</th><th style="width:110px">缴费金额</th><th style="width:100px">操作</th></tr></thead><tbody>${user.records.map(record => {
          return `<tr><td><strong>${record.orderNo}</strong></td><td>${record.project}</td><td>${record.plates}</td><td class="user-rent-period">${record.period}</td><td>${tag(record.rentStatus)}</td><td>${record.amount}</td><td><button class="btn-text" onclick="openOrder('${record.orderNo}')">查看订单</button></td></tr>`;
        }).join('')}</tbody></table>`
        : '<div class="user-detail-empty">该用户暂无月租办理记录</div>';
      const cancellationInfo = user.cancelledAt ? `${infoItem('账号状态', tag('已注销'))}${infoItem('注销时间', user.cancelledAt)}` : '';
      const refundAccount = user.refundAccount
        ? `<div class="detail-info-grid">${infoItem('账户类型', user.refundAccount.accountType)}${infoItem('开户行', user.refundAccount.bankName)}${infoItem('收款账号', sensitive.accountNo)}${infoItem('账户联系电话', sensitive.accountPhone)}${infoItem('更新时间', user.refundAccount.updatedAt)}</div>`
        : '<div class="user-detail-empty">该用户暂未设置退款账户</div>';
      return `${innerPageHead('用户详情', 'backToUsers()')}<section class="detail-page-section"><div class="detail-section-heading"><h3 class="detail-page-title">用户信息</h3>${revealAction}</div><div class="detail-info-grid">${infoItem('用户姓名', user.name)}${infoItem('手机号', sensitive.phone)}${infoItem('身份证号', sensitive.idCard)}${infoItem('登录方式', user.login)}${infoItem('月租状态', tag(userRentStatus(user.records)))}${cancellationInfo}${infoItem('创建时间', user.createdAt)}${infoItem('更新时间', user.updatedAt)}</div></section><section class="detail-page-section"><h3 class="detail-page-title">退款账户</h3>${refundAccount}</section><section class="detail-page-section"><h3 class="detail-page-title">车辆与绑定</h3>${vehicles}</section><section class="detail-page-section"><h3 class="detail-page-title">月租办理记录</h3>${rentRecords}</section>`;
    }
