
    // 登录页：用户名下拉。选项 = 启用中的账号；普通账号登录后看不到「系统管理」
    function loginAccountList() { return systemAccounts.filter(account => account[2] === '启用'); }
    function setLoginAccount(name) {
      const list = loginAccountList();
      const account = list.find(item => item[0] === name) || list[0];
      if (!account) return;
      const dropdown = document.getElementById('loginAccountSelect');
      const input = document.getElementById('loginUsername');
      const text = document.getElementById('loginAccountText');
      if (input) input.value = account[0];
      if (text) text.textContent = account[0];
      if (dropdown) dropdown.dataset.value = account[0];
      document.querySelectorAll('#loginAccountMenu .select-option').forEach(option => option.classList.toggle('active', option.dataset.value === account[0]));
    }
    function toggleLoginAccountMenu(event) {
      event.stopPropagation();
      const dropdown = document.getElementById('loginAccountSelect');
      if (!dropdown) return;
      const isOpen = dropdown.classList.toggle('open');
      const trigger = dropdown.querySelector('.select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
    }
    function selectLoginAccount(event, name) {
      event.stopPropagation();
      setLoginAccount(name);
      const dropdown = document.getElementById('loginAccountSelect');
      if (dropdown) {
        dropdown.classList.remove('open');
        const trigger = dropdown.querySelector('.select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
      const error = document.getElementById('loginError');
      if (error) error.textContent = '';
    }
    function initLoginAccountSelect() {
      const menu = document.getElementById('loginAccountMenu');
      if (!menu) return;
      menu.innerHTML = loginAccountList().map(([name, role]) => `<button type="button" class="select-option" data-value="${name}" onclick="selectLoginAccount(event, '${name}')"><span>${name}</span><span class="login-account-role">${role}</span></button>`).join('');
      setLoginAccount('admin');
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLoginAccountSelect); else initLoginAccountSelect();

    function login() {
      const loginName = document.getElementById('loginUsername')?.value.trim() || 'admin';
      const password = document.getElementById('loginPassword')?.value || '';
      const account = systemAccounts.find(item => item[0] === loginName && item[2] === '启用');
      const error = document.getElementById('loginError');
      if (!account || password !== currentPassword) {
        if (error) error.textContent = '用户名或密码错误';
        return;
      }
      if (error) error.textContent = '';
      currentAccountType = account?.[1] || '普通账号';
      currentLoginName = loginName;
      current = 'projects'; garageSubpage = 'list'; userSubpage = 'list'; orderSubpage = 'list'; passageSubpage = 'list'; refundSubpage = 'list';
      document.getElementById('login').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      render();
    }
    function toggleAccountMenu(event) {
      if (event && event.target && event.target.closest && event.target.closest('.account-menu')) return;
      const menu = document.getElementById('accountMenu');
      if (menu) menu.classList.toggle('open');
    }
    function closeAccountMenu() {
      const menu = document.getElementById('accountMenu');
      if (menu) menu.classList.remove('open');
    }
    function openProfile() {
      closeAccountMenu();
      current = 'profile'; garageSubpage = 'list'; userSubpage = 'list'; orderSubpage = 'list'; passageSubpage = 'list'; refundSubpage = 'list'; invoiceSubpage = 'list'; settlementSubpage = 'list';
      render();
    }
    // 个人中心的个人信息区默认是只读展示，点「编辑资料」才把用户名/手机号变成输入框（登录账号始终不可改）
    function startProfileEdit() {
      const section = document.getElementById('profileInfoSection');
      if (!section) return;
      const error = document.getElementById('profileError');
      if (error) error.textContent = '';
      section.querySelectorAll('.profile-input.has-error').forEach(input => input.classList.remove('has-error'));
      // 输入框以当前展示值起编，避免残留上一次未保存的脏值
      section.querySelectorAll('.profile-text[data-text-for]').forEach(node => {
        const input = document.getElementById(node.getAttribute('data-text-for'));
        if (input) input.value = node.textContent === '未填写' ? '' : node.textContent;
      });
      section.classList.add('is-editing');
      const firstInput = section.querySelector('.profile-input');
      if (firstInput) firstInput.focus();
    }
    function cancelProfileEdit() {
      const section = document.getElementById('profileInfoSection');
      if (!section) return;
      const error = document.getElementById('profileError');
      if (error) error.textContent = '';
      section.querySelectorAll('.profile-input.has-error').forEach(input => input.classList.remove('has-error'));
      section.classList.remove('is-editing');
    }
    function saveProfile() {
      const profile = profileOf(currentLoginName);
      const error = document.getElementById('profileError');
      if (error) error.textContent = '';
      document.querySelectorAll('.profile-input.has-error').forEach(input => input.classList.remove('has-error'));
      const fail = (field, message) => {
        document.getElementById(field)?.classList.add('has-error');
        if (error) error.textContent = message;
      };
      const value = field => (document.getElementById(field)?.value || '').trim();
      const values = { nickname: value('nickname'), phone: value('phone') };
      if (values.phone && !/^1[3-9]\d{9}$/.test(values.phone)) return fail('phone', '手机号格式不正确，请填写 11 位手机号');
      Object.assign(profile, values);
      const nameNode = document.getElementById('profileName');
      if (nameNode) nameNode.textContent = profile.nickname || currentLoginName;
      const section = document.getElementById('profileInfoSection');
      if (section) {
        section.querySelectorAll('.profile-text[data-text-for]').forEach(node => {
          node.textContent = values[node.getAttribute('data-text-for')] || '未填写';
        });
        section.classList.remove('is-editing');
      }
      showModal('资料已保存', '<div class="modal-tip">个人信息已更新。登录账号由系统分配，不支持修改。</div>');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '完成'; confirmButton.onclick = hideModal; }
    }
    let pendingAvatarUrl = '';
    function openAvatarModal() {
      pendingAvatarUrl = '';
      const avatar = profileAvatars[currentLoginName];
      showModal('更换头像', `<div class="modal-tip">请上传 1:1 的 JPG、JPEG 或 PNG 图片，大小不超过 2MB。更换后顶栏与账号管理列表同步生效。</div><div class="avatar-upload"><div class="avatar-upload-preview" id="avatarPreview">${avatar ? `<img src="${avatar}" alt="头像预览">` : accountAvatarLetter(currentLoginName)}</div><label class="create-upload"><input id="avatarFile" type="file" accept="image/png,image/jpeg" onchange="previewAvatarFile(this)"><button type="button" class="btn" onclick="document.getElementById('avatarFile').click()">选择图片</button><span id="avatarFileName" class="create-upload-name">未选择文件</span></label></div><div id="avatarError" class="approval-error"></div>`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = () => { pendingAvatarUrl = ''; hideModal(); }; }
      if (confirmButton) { confirmButton.textContent = '确认更换'; confirmButton.onclick = saveAvatar; }
    }
    function previewAvatarFile(input) {
      const file = input?.files?.[0];
      const error = document.getElementById('avatarError');
      const nameNode = document.getElementById('avatarFileName');
      if (nameNode) nameNode.textContent = file ? file.name : '未选择文件';
      if (error) error.textContent = '';
      pendingAvatarUrl = '';
      if (!file) return;
      if (!/^image\/(png|jpe?g)$/i.test(file.type)) { if (error) error.textContent = '仅支持 JPG、JPEG、PNG 图片'; return; }
      if (file.size > 2 * 1024 * 1024) { if (error) error.textContent = '图片大小不能超过 2MB'; return; }
      pendingAvatarUrl = URL.createObjectURL(file);
      const preview = document.getElementById('avatarPreview');
      if (preview) preview.innerHTML = `<img src="${pendingAvatarUrl}" alt="头像预览">`;
    }
    function saveAvatar() {
      const error = document.getElementById('avatarError');
      if (!pendingAvatarUrl) { if (error) error.textContent = '请先选择头像图片'; return; }
      const previous = profileAvatars[currentLoginName];
      if (previous && previous !== pendingAvatarUrl && previous.startsWith('blob:')) URL.revokeObjectURL(previous);
      profileAvatars[currentLoginName] = pendingAvatarUrl;
      pendingAvatarUrl = '';
      hideModal();
      render();
    }
    function openChangePasswordModal(loginName = '') {
      const scopeTip = loginName ? `账号 <strong>${loginName}</strong>：` : '';
      showModal('修改登录密码', `<div class="modal-tip">${scopeTip}修改后立即生效，下次登录请使用新密码。</div><div class="modal-form-row"><label for="profileOldPassword">当前密码</label><input id="profileOldPassword" class="form-control" type="password" placeholder="请输入当前密码"></div><div class="modal-form-row"><label for="profileNewPassword">新密码</label><input id="profileNewPassword" class="form-control" type="password" placeholder="至少 6 位字符"></div><div class="modal-form-row"><label for="profileConfirmPassword">确认新密码</label><input id="profileConfirmPassword" class="form-control" type="password" placeholder="请再次输入新密码"></div><div id="profilePasswordError" class="approval-error"></div>`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '确认修改'; confirmButton.onclick = saveNewPassword; }
    }
    function saveNewPassword() {
      const oldPassword = document.getElementById('profileOldPassword')?.value || '';
      const newPassword = document.getElementById('profileNewPassword')?.value || '';
      const confirmPassword = document.getElementById('profileConfirmPassword')?.value || '';
      const error = document.getElementById('profilePasswordError');
      const fail = message => { if (error) error.textContent = message; };
      if (!oldPassword) return fail('请输入当前密码');
      if (oldPassword !== currentPassword) return fail('当前密码不正确');
      if (newPassword.length < 6) return fail('新密码长度不能少于 6 位');
      if (newPassword === currentPassword) return fail('新密码不能与当前密码相同');
      if (newPassword !== confirmPassword) return fail('两次输入的新密码不一致');
      currentPassword = newPassword;
      const loginInput = document.getElementById('loginPassword');
      if (loginInput) loginInput.value = currentPassword;
      hideModal();
      showModal('密码修改成功', '<div class="modal-tip">新密码已生效，请使用新密码登录。</div>');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '完成'; confirmButton.onclick = hideModal; }
    }
    // ===== 登录页底部辅助链接：修改密码 / 忘记密码 =====
    function openLoginChangePassword() {
      openChangePasswordModal(document.getElementById('loginUsername')?.value || '');
    }
    function openForgotPassword() {
      showModal('忘记密码', '<div class="modal-tip">后台账号由管理员统一创建，密码无法自助找回，请联系系统管理员重置。</div>');
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) cancelButton.style.display = 'none';
      if (confirmButton) { confirmButton.textContent = '知道了'; confirmButton.onclick = hideModal; }
    }
    function logout() {
      closeAccountMenu();
      current = 'projects'; garageSubpage = 'list'; userSubpage = 'list'; orderSubpage = 'list'; passageSubpage = 'list'; refundSubpage = 'list';
      if (typeof selectedOrderIds !== 'undefined' && selectedOrderIds.clear) selectedOrderIds.clear();
      document.getElementById('app').classList.add('hidden');
      document.getElementById('login').classList.remove('hidden');
      const loginError = document.getElementById('loginError');
      if (loginError) loginError.textContent = '';
    }
    document.addEventListener('click', function (event) {
      if (!event.target || !event.target.closest || !event.target.closest('#accountBox')) closeAccountMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAccountMenu();
    });
    function openCreateAccountModal() {
      showModal('新增账号', `<div class="modal-tip">工作人员姓名、手机号等个人信息由工作人员首次登录后自行补充。首次登录必须修改初始密码。</div><div class="modal-form-grid">
        <div class="modal-form-field"><label for="accountLoginName">用户名</label><input id="accountLoginName" class="form-control" placeholder="请输入用户名"></div>
        <div class="modal-form-field"><label for="accountInitialPassword">初始密码</label><input id="accountInitialPassword" class="form-control" value="${DEFAULT_INITIAL_PASSWORD}" readonly></div>
      </div><div id="accountFormError" class="approval-error"></div>`);
      const modal = document.querySelector('#modalMask .modal');
      if (modal) modal.classList.add('account-create-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '保存'; confirmButton.onclick = saveNewAccount; }
    }
    function saveNewAccount() {
      const loginName = document.getElementById('accountLoginName')?.value.trim() || '';
      const error = document.getElementById('accountFormError');
      if (!loginName) {
        if (error) error.textContent = '请输入用户名';
        return;
      }
      if (systemAccounts.some(account => account[0] === loginName)) {
        if (error) error.textContent = '用户名已存在，请更换后再保存';
        return;
      }
      systemAccounts.push([loginName, '普通账号', '启用', '从未登录']);
      hideModal();
      render();
      showModal('账号创建成功', `<div class="modal-tip">账号 <strong>${loginName}</strong> 已创建。请将以下初始密码交给工作人员，首次登录后必须修改：</div><div class="initial-password"><strong>${DEFAULT_INITIAL_PASSWORD}</strong><button class="copy-password" type="button" onclick="copyDefaultPassword()">复制密码</button></div>`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '完成'; confirmButton.onclick = hideModal; }
    }
    function copyDefaultPassword() {
      const fallback = document.createElement('textarea');
      fallback.value = DEFAULT_INITIAL_PASSWORD;
      document.body.appendChild(fallback);
      fallback.select();
      try { document.execCommand('copy'); } catch (error) {}
      fallback.remove();
      const button = document.querySelector('.copy-password');
      if (button) { button.textContent = '已复制'; setTimeout(() => { button.textContent = '复制密码'; }, 1400); }
    }
    function toggleAccountStatus(loginName) {
      const account = systemAccounts.find(item => item[0] === loginName);
      if (!account || loginName === 'admin') return;
      const nextStatus = account[2] === '启用' ? '停用' : '启用';
      showModal(`${nextStatus}账号`, `确认${nextStatus}账号"${loginName}"吗？${nextStatus === '停用' ? '停用后该账号将不能登录后台。' : '启用后该账号可以继续登录后台。'}`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = `确认${nextStatus}`;
        confirmButton.onclick = () => { account[2] = nextStatus; hideModal(); render(); };
      }
    }

    function openResetPasswordModal(username) {
      showModal('重置密码', `<div class="modal-tip">为账号 <strong>${username}</strong> 设置新密码。新密码设置后立即生效，工作人员下次登录时需使用新密码。</div><div class="modal-form-row">
        <label for="resetNewPassword">新密码</label><input id="resetNewPassword" class="form-control" type="password" placeholder="请输入新密码">
      </div><div id="resetPasswordError" class="approval-error"></div>`);
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.textContent = '确认重置'; confirmButton.onclick = () => saveResetPassword(username); }
    }

    function saveResetPassword(username) {
      const newPwd = document.getElementById('resetNewPassword')?.value || '';
      const error = document.getElementById('resetPasswordError');
      if (!newPwd) {
        if (error) error.textContent = '请输入新密码';
        return;
      }
      if (newPwd.length < 6) {
        if (error) error.textContent = '密码长度不能少于 6 位';
        return;
      }
      hideModal();
      showModal('密码重置成功', `账号 <strong>${username}</strong> 的密码已重置。请将新密码通知工作人员，下次登录时使用新密码。`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) { confirmButton.textContent = '完成'; confirmButton.onclick = hideModal; }
    }

    function deleteAccount(username) {
      showModal('删除账号', `确认删除账号 <strong>${username}</strong> 吗？删除后该账号将无法登录，且操作不可恢复。`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '确认删除';
        confirmButton.onclick = () => {
          const index = systemAccounts.findIndex(acc => acc[0] === username);
          if (index > -1) {
            systemAccounts.splice(index, 1);
            hideModal();
            render();
          }
        };
      }
    }

    function batchDeleteAccounts() {
      const checkboxes = document.querySelectorAll('.account-checkbox:checked:not(:disabled)');
      if (checkboxes.length === 0) {
        showModal('提示', '请先勾选要删除的账号');
        return;
      }
      const usernames = Array.from(checkboxes).map(cb => cb.dataset.username);
      showModal('批量删除账号', `确认删除以下 <strong>${usernames.length}</strong> 个账号吗？<br><br>${usernames.join('、')}<br><br>删除后这些账号将无法登录，且操作不可恢复。`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '确认删除';
        confirmButton.onclick = () => {
          usernames.forEach(username => {
            const index = systemAccounts.findIndex(acc => acc[0] === username);
            if (index > -1) systemAccounts.splice(index, 1);
          });
          hideModal();
          render();
        };
      }
    }

    function showLogDetail(index) {
      const log = operationLogs[index];
      if (!log) return;
      const content = `<div class="log-detail-list">
        <div class="log-detail-item"><span class="log-detail-label">操作人</span><span class="log-detail-value">${log[0]}</span></div>
        <div class="log-detail-item"><span class="log-detail-label">操作模块</span><span class="log-detail-value">${log[1]}</span></div>
        <div class="log-detail-item"><span class="log-detail-label">操作类型</span><span class="log-detail-value">${log[2]}</span></div>
        <div class="log-detail-item"><span class="log-detail-label">操作对象</span><span class="log-detail-value">${log[3]}</span></div>
        <div class="log-detail-item"><span class="log-detail-label">操作内容</span><span class="log-detail-value">${log[4]}</span></div>
        <div class="log-detail-item"><span class="log-detail-label">处理结果</span><span class="log-detail-value">${log[5]}</span></div>
        <div class="log-detail-item"><span class="log-detail-label">操作时间</span><span class="log-detail-value">${log[6]}</span></div>
      </div>`;
      showModal('日志详情', content);
    }

    function toggleSelectAll() {
      const selectAllCheckbox = document.getElementById('selectAllCheckbox');
      const checkboxes = document.querySelectorAll('.account-checkbox:not(:disabled)');
      const isChecked = selectAllCheckbox?.checked;
      checkboxes.forEach(cb => { cb.checked = isChecked; });
    }

    function tag(text, type) { return `<span class="tag tag-${type || tagType(text)}">${text}</span>`; }
    function tagType(text) {
      if (/成功|有效|已同步|已开通|已发布|通过|正常|可办理|完成|已退款|启用|已清分|已恢复/.test(text)) return 'success';
      if (/待|未推送|确认中|草稿|申请中|处理中|暂停|未开通|待生效/.test(text)) return 'warning';
      if (/异常|失败|开通失败|驳回|已满|停用|已取消/.test(text)) return 'danger';
      if (/进行中|续费|新办|首次办理|同步中|清分中|清算中/.test(text)) return 'info';
      if (/已终止|已结束|通行失效/.test(text)) return 'gray';
      return 'gray';
    }
    function iconSvg(name) {
      const icons = {
        dashboard: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
        garage: '<svg viewBox="0 0 24 24"><path d="M4 21V8l8-5 8 5v13"/><path d="M8 21v-8h8v8"/><path d="M10 17h4"/></svg>',
        config: '<svg viewBox="0 0 24 24"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/></svg>',
        users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        orders: '<svg viewBox="0 0 24 24"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>',
        approval: '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-5"/><path d="M21 12a9 9 0 1 1-3.5-7.1"/></svg>',
        alert: '<svg viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/></svg>',
        plate: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h3"/><path d="M14 12h3"/><path d="M7 3l-3 4"/><path d="M17 3l3 4"/></svg>',
        refund: '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 1 1 0 10H8"/></svg>',
        export: '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
        system: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 8.6 19a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 5 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06A2 2 0 1 1 7.43 3.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 0 1 4 0v.1A1.7 1.7 0 0 0 15 5a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.08.35.28.7.6 1 .32.32.68.52 1.1.6h.1a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.7.4Z"/></svg>',
        check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/><path d="M4 19h16"/></svg>',
        pay: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M7 15h4"/></svg>',
        clipboard: '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 14l2 2 4-5"/></svg>',
        retry: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>'
      };
      return icons[name] || icons.dashboard;
    }
    function money(v) { return `<strong>${v}</strong>`; }
    function pageShell(title, actions, body) { return `<div class="page-header"><h2 class="page-title">${title}</h2></div>${body}`; }
    function panel(title, body, right='') { return `<section class="panel list-panel">${title ? `<div class="panel-header"><div class="data-panel-title">${title}</div>${right}</div>` : ''}${body}</section>`; }
    const dashboardState = { range: 7 };
    let filterDropdownSeed = 0;
    function filterControl(item) {
      const kind = item[0];
      const label = item[1];
      const controlId = item[3] ? ` id="${item[3]}"` : '';
      const action = item[4] ? ` oninput="${item[4]}()"` : '';
      if (kind === 'input') return `<input${controlId} class="input" type="search" placeholder="${label}" autocomplete="off"${action}>`;
      if (kind === 'date') return `<input${controlId} class="input" type="date" aria-label="${label}"${action}>`;
      const id = item[3] || `filterDropdown${filterDropdownSeed++}`;
      const options = item[2] || ['全部'];
      const optionHtml = options.map((option, index) => `<button type="button" class="select-option${index === 0 ? ' active' : ''}" data-value="${index === 0 ? '' : option}" onclick="selectFilterOption(event, '${id}')">${option}</button>`).join('');
      return `<div id="${id}" class="filter-dropdown" data-filter-label="${label}"${item[4] ? ` data-filter-action="${item[4]}"` : ''}><button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleFilterDropdown(event, '${id}')"><span>${options[0]}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="select-menu" role="listbox">${optionHtml}</div></div>`;
    }
    function filters(items, extra='', className='filter-bar', actions={}) {
      const queryAction = typeof actions === 'string' ? actions : actions.query;
      const resetAction = typeof actions === 'string' ? actions : actions.reset;
      return `<div class="${className}">${items.map(filterControl).join('')}<button class="btn btn-primary"${queryAction ? ` onclick="${queryAction}()"` : ''}>查询</button><button class="btn"${resetAction ? ` onclick="${resetAction}()"` : ''}>重置</button>${extra}</div>`;
    }
    function table(headers, rows, firstColRenderer, actionRenderer, tagColumns) {
      // 兼容旧的调用方式：table(headers, rows, actionRenderer)
      if (typeof firstColRenderer === 'function' && !actionRenderer) {
        actionRenderer = firstColRenderer;
        firstColRenderer = null;
      }
      // tagColumns：仅这些「数据列下标」按状态标签渲染；不传则全部列沿用原逻辑
      const canTag = (idx) => !tagColumns || tagColumns.indexOf(idx) > -1;
      const tableRows = rows.length
        ? rows.map((r,i)=>`<tr>${firstColRenderer ? `<td>${firstColRenderer(r,i)}</td>` : ''}${r.map((c,idx)=>`<td>${statusCell(c, canTag(idx))}</td>`).join('')}<td><div class="table-actions">${actionRenderer ? actionRenderer(r,i) : defaultActions(r)}</div></td></tr>`).join('')
        : `<tr><td colspan="${headers.length + 1}"><div class="empty">暂无符合条件的数据</div></td></tr>`;
      const headerHtml = headers.map((h, idx) => {
        // 第一列且有 firstColRenderer，显示全选复选框
        if (idx === 0 && firstColRenderer && h[0].trim() === '') {
          return `<th style="width:${h[1]||'auto'}"><input type="checkbox" id="selectAllCheckbox" onclick="toggleSelectAll()"></th>`;
        }
        return `<th style="width:${h[1]||'auto'}">${h[0]}</th>`;
      }).join('');
      return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${tableRows}</tbody></table><div class="pager"><span>共 ${rows.length} 条</span><span class="page-box">‹</span><span class="page-box active">1</span><span class="page-box">2</span><span class="page-box">3</span><span class="page-box">›</span></div>`;
    }
    function statusCell(c, allowTag) {
      if (typeof c === 'string' && c.indexOf('__html__') === 0) return c.slice(8);
      if (allowTag === false) return c;
      return /待|成功|有效|已同步|已开通|异常|失败|取消|发布|草稿|申请中|处理中|通过|驳回|完成|已退款|未推送|确认中|可办理|暂停|已满|启用|停用|新办|首次办理|已终止|已过期|已结束|通行失效|已清分/.test(c) && c.length < 10 ? tag(c) : c;
    }
    function defaultActions(r) { return `<button class="btn-text" onclick="openGeneric('${r[0]}')">查看</button><button class="btn-text" onclick="showModal('处理确认','将对 ${r[0]} 执行当前业务处理，并记录操作日志。')">处理</button>`; }
    function infoItem(label, value) {
      return `<div class="detail-info-item"><div class="detail-info-label">${label}</div><div class="detail-info-value">${value}</div></div>`;
    }
    function backToGarage() { garageSubpage = 'list'; current = 'projects'; render(); }
    function backToUsers() { userSubpage = 'list'; current = 'users'; render(); }
    function backToOrders() { const backToLedger = orderReturnPage === 'ledger'; orderReturnPage = 'orders'; selectedOrderIds.clear(); orderSubpage = 'list'; current = backToLedger ? 'ledger' : 'orders'; render(); }
    function backToPassages() { passageSubpage = 'list'; current = 'passages'; render(); }
    function toggleFinanceMenu() { financeMenuExpanded = !financeMenuExpanded; render(); }
    function openFinancePage(id) { financeMenuExpanded = true; switchPage(id); }
    function toggleSystemMenu() { systemMenuExpanded = !systemMenuExpanded; render(); }
    function openSystemPage(id) { systemMenuExpanded = true; switchPage(id); }
    function innerPageHead(title, backAction = 'backToGarage()') {
      return `<div class="inner-page-head"><button class="inner-page-back" onclick="${backAction}"><span class="inner-page-back-arrow">←</span><span>返回</span></button><h2 class="inner-page-title">${title}</h2></div>`;
    }
    function withoutHeader(html) { return html.replace(/^<div class="page-header">[\s\S]*?<\/div>/, ''); }
    function withoutTabs(html) { return html.replace(/<div class="tabs(?: [^"]*)?">[\s\S]*?<\/div>/g, ''); }
    function withoutPanelHeader(html) { return html.replace(/<div class="panel-header"><div class="data-panel-title">[\s\S]*?<\/div><\/div>/, ''); }
    document.addEventListener('click', () => {
      document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
        dropdown.classList.remove('open');
        const trigger = dropdown.querySelector('.select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    });

    function detailFeeField(label, value) {
      return `<div class="detail-fee-field"><div class="detail-fee-label">${label}</div><div class="detail-fee-value">${value}</div></div>`;
    }
    function detailFeeItem(item) {
      return `<div class="detail-fee-item">${detailFeeField('收费项', item.name)}${detailFeeField('收费金额', item.amount)}${detailFeeField('清分比例', item.split)}${detailFeeField('负责人', item.owner)}</div>`;
    }
    function detailNoticeItem(name, file) {
      return `<div class="detail-notice-item"><div class="detail-notice-name">${name}</div><div class="detail-notice-file">${file}</div><button class="btn-text" onclick="showModal('查看告知书','${name}（${file}）已配置，可查看该项目当前使用的告知书文件。')">查看</button></div>`;
    }
    function openGeneric(id) { showDrawer('业务详情', `<div class="detail-section"><div class="detail-title">基础信息</div><div class="detail-grid"><div><div class="field-label">关联编号</div><div class="field-value">${id}</div></div><div><div class="field-label">当前状态</div><div class="field-value">${tag('待处理')}</div></div></div></div>`); }
    function showDrawer(title, body) { document.getElementById('drawerTitle').textContent = title; document.getElementById('drawerBody').innerHTML = body; document.getElementById('drawerMask').classList.add('open'); }
    function hideDrawer() { document.getElementById('drawerMask').classList.remove('open'); }
    function closeDrawer(e) { if (e.target.id === 'drawerMask') hideDrawer(); }
    function openOrderPushConfigModal() {
      showModal('订单推送配置', `<div class="push-config-modal-body">
        <div class="modal-tip">请前往微信公众平台小程序后台的“订阅消息”中配置模板；系统将根据订单到期时间计算推送日期，用户需在小程序端完成订阅授权后才能接收微信订阅消息。</div>
        <div class="push-config-form">
          <div class="form-item push-config-field"><label class="form-label" for="orderPushEnabled">启用提醒</label><label class="switch-control"><input id="orderPushEnabled" type="checkbox" checked><span class="switch-slider"></span></label></div>
          <div class="form-item push-config-field push-config-days-field"><span class="form-label">到期前推送</span><div class="push-config-days-list"><div class="push-config-day-row"><input class="form-control order-push-day" type="number" min="1" max="30" value="7"><span>天</span><button class="btn-text danger" type="button" onclick="removeOrderPushDay(this)">删除</button></div><div class="push-config-day-row"><input class="form-control order-push-day" type="number" min="1" max="30" value="3"><span>天</span><button class="btn-text danger" type="button" onclick="removeOrderPushDay(this)">删除</button></div><button class="btn-text push-config-add-day" type="button" onclick="addOrderPushDay()">+ 添加提醒时间</button></div></div>
        </div>
      </div>`);
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '保存配置';
        confirmButton.onclick = () => {
          hideModal();
          showModal('配置已保存', '订单推送规则已更新，所有项目的月租订单将按新配置执行到期提醒。');
        };
      }
    }
    function addOrderPushDay() {
      const list = document.querySelector('.push-config-days-list');
      if (!list) return;
      const row = document.createElement('div');
      row.className = 'push-config-day-row';
      row.innerHTML = '<input class="form-control order-push-day" type="number" min="1" max="30" placeholder="请输入"><span>天</span><button class="btn-text danger" type="button" onclick="removeOrderPushDay(this)">删除</button>';
      list.insertBefore(row, list.querySelector('.push-config-add-day'));
    }
    function removeOrderPushDay(button) {
      const rows = document.querySelectorAll('.push-config-day-row');
      if (rows.length <= 1) return;
      button.closest('.push-config-day-row')?.remove();
    }
    function showModal(title, body) {
      const rejectButton = document.getElementById('modalRejectButton');
      if (rejectButton) { rejectButton.style.display = 'none'; rejectButton.onclick = null; }
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalBody').innerHTML = body;
      document.querySelector('#modalMask .modal')?.classList.remove('refund-approval-modal', 'refund-application-modal', 'project-status-modal', 'project-stop-modal', 'renew-order-modal', 'invoice-application-modal', 'invoice-preview-modal');
      const cancelButton = document.getElementById('modalCancelButton');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (cancelButton) { cancelButton.textContent = '取消'; cancelButton.className = 'btn'; cancelButton.style.display = ''; cancelButton.onclick = hideModal; }
      if (confirmButton) { confirmButton.style.display = ''; confirmButton.textContent = '确认'; confirmButton.className = 'btn btn-primary'; confirmButton.onclick = hideModal; }
      document.getElementById('modalMask').classList.add('open');
    }
    function hideModal() { closeDatePicker(); document.getElementById('modalMask').classList.remove('open'); }
    function closeModal(e) { if (e.target.id === 'modalMask') hideModal(); }
    function csvCell(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }
    function downloadCsv(filename, lines, eol = '\n') {
      const blob = new Blob([`\uFEFF${lines.join(eol)}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    // ===== 日期选择器：对齐 Ant Design DatePicker（点整块输入框弹出日历、点选日期回填）=====
    const datePickerState = { targetId: '', view: '' };
    let datePickerPanelNode = null;
    let datePickerOutsideHandler = null;
    function datePickerTodayIso() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    function datePickerPad(value) { return String(value).padStart(2, '0'); }
    function datePickerPanel() {
      if (!datePickerPanelNode) {
        datePickerPanelNode = document.createElement('div');
        datePickerPanelNode.className = 'date-picker-panel hidden';
        datePickerPanelNode.addEventListener('click', event => event.stopPropagation());
        document.body.appendChild(datePickerPanelNode);
      }
      return datePickerPanelNode;
    }
    function datePickerTrigger(targetId) { return document.querySelector(`[data-datepicker-target="${targetId}"]`); }
    function datePickerSyncTrigger(targetId) {
      const trigger = datePickerTrigger(targetId);
      const input = document.getElementById(targetId);
      if (!trigger) return;
      const text = trigger.querySelector('.date-picker-text');
      const value = input?.value || '';
      if (!text) return;
      text.textContent = value || trigger.dataset.datepickerPlaceholder || '请选择日期';
      text.classList.toggle('is-placeholder', !value);
    }
    function toggleDatePicker(targetId) {
      const panel = datePickerPanel();
      if (datePickerState.targetId === targetId && !panel.classList.contains('hidden')) { closeDatePicker(); return; }
      const value = document.getElementById(targetId)?.value || '';
      datePickerState.targetId = targetId;
      datePickerState.view = /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : datePickerTodayIso().slice(0, 7);
      panel.classList.remove('hidden');
      renderDatePickerPanel();
      datePickerTrigger(targetId)?.classList.add('is-open');
      datePickerPosition();
      datePickerBindOutside();
    }
    function closeDatePicker() {
      if (!datePickerPanelNode) return;
      datePickerPanelNode.classList.add('hidden');
      datePickerTrigger(datePickerState.targetId)?.classList.remove('is-open');
      datePickerState.targetId = '';
      if (datePickerOutsideHandler) {
        document.removeEventListener('click', datePickerOutsideHandler, true);
        datePickerOutsideHandler = null;
      }
    }
    function datePickerBindOutside() {
      if (datePickerOutsideHandler) document.removeEventListener('click', datePickerOutsideHandler, true);
      datePickerOutsideHandler = event => {
        const panel = datePickerPanelNode;
        const trigger = datePickerTrigger(datePickerState.targetId);
        if (!panel || panel.contains(event.target)) return;
        if (trigger && trigger.contains(event.target)) return;
        closeDatePicker();
      };
      setTimeout(() => { if (datePickerOutsideHandler) document.addEventListener('click', datePickerOutsideHandler, true); }, 0);
    }
    function datePickerPosition() {
      const panel = datePickerPanelNode;
      const trigger = datePickerTrigger(datePickerState.targetId);
      if (!panel || !trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(Math.max(280, Math.round(rect.width)), 300); // 对齐 Ant Design：面板固定窄宽，不随输入框拉满
      panel.style.width = `${width}px`;
      const height = panel.offsetHeight || 328;
      let top = rect.bottom + 6;
      if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
      const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    }
    function shiftDatePicker(months) {
      const [year, month] = datePickerState.view.split('-').map(Number);
      const next = new Date(year, month - 1 + months, 1);
      datePickerState.view = `${next.getFullYear()}-${datePickerPad(next.getMonth() + 1)}`;
      renderDatePickerPanel();
      datePickerPosition();
    }
    function renderDatePickerPanel() {
      const panel = datePickerPanelNode;
      if (!panel) return;
      const [year, month] = datePickerState.view.split('-').map(Number);
      const today = datePickerTodayIso();
      const selected = document.getElementById(datePickerState.targetId)?.value || '';
      const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 周一为第一列
      const days = [];
      for (let index = 0; index < 42; index += 1) {
        const day = new Date(year, month - 1, 1 - lead + index);
        const iso = `${day.getFullYear()}-${datePickerPad(day.getMonth() + 1)}-${datePickerPad(day.getDate())}`;
        const disabled = iso > today;
        const classes = ['date-picker-day'];
        if (day.getMonth() !== month - 1) classes.push('is-outside');
        if (iso === today) classes.push('is-today');
        if (iso === selected) classes.push('is-selected');
        if (disabled) classes.push('is-disabled');
        days.push(`<button type="button" class="${classes.join(' ')}"${disabled ? ' disabled' : ''} onclick="pickDatePicker('${iso}')">${day.getDate()}</button>`);
      }
      const nav = (step, title, label) => `<button type="button" class="date-picker-nav" title="${title}" onclick="shiftDatePicker(${step})">${label}</button>`;
      panel.innerHTML = `<div class="date-picker-head">${nav(-12, '上一年', '«')}${nav(-1, '上一月', '‹')}<div class="date-picker-title">${year}年${month}月</div>${nav(1, '下一月', '›')}${nav(12, '下一年', '»')}</div><div class="date-picker-week">${['一', '二', '三', '四', '五', '六', '日'].map(item => `<span>${item}</span>`).join('')}</div><div class="date-picker-grid">${days.join('')}</div><div class="date-picker-foot"><button type="button" class="btn-text" onclick="pickDatePicker('${today}')">今天</button></div>`;
    }
    function pickDatePicker(iso) {
      const targetId = datePickerState.targetId;
      const input = document.getElementById(targetId);
      if (input) input.value = iso;
      datePickerSyncTrigger(targetId);
      const field = input?.closest('.modal-form-field');
      field?.classList.remove('has-error');
      const error = field?.querySelector('.approval-error, .modal-field-error') || field?.parentElement?.querySelector('.approval-error, .modal-field-error');
      if (error) error.textContent = '';
      closeDatePicker();
    }
    window.addEventListener('resize', () => { if (datePickerState.targetId) datePickerPosition(); });
