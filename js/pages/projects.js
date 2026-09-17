    function selectedGarage() {
      return garages.find(garage => garage[0] === selectedGarageName) || garages[0];
    }
    function defaultMonthlyFeeItem() {
      return { key: 'monthlyAmount', label: '月租车费', required: true, placeholder: '请输入月租金额', receiverKey: 'monthlyReceiver', merchantKey: 'monthlyMerchantId', responsibleKey: 'monthlyResponsible', responsiblePhoneKey: 'monthlyResponsiblePhone', bankAccountKey: 'monthlyBankAccount' };
    }
    function orderFeeItems(items) {
      const monthlyIndex = items.findIndex(item => item.key === 'monthlyAmount');
      if (monthlyIndex < 0) return [defaultMonthlyFeeItem(), ...items];
      return [items[monthlyIndex], ...items.filter((item, index) => index !== monthlyIndex)];
    }
    function openGarageDetail(name) {
      selectedGarageName = name;
      garageSubpage = 'detail';
      current = 'projects';
      render();
    }
    function openGarageEdit(name) {
      selectedGarageName = name;
      const garage = selectedGarage();
      const [totalSpaces, rentedSpaces, availableSpaces] = garage[3].split('/').map(value => value.trim());
      Object.keys(newGarageForm).forEach(key => { newGarageForm[key] = ''; });
      Object.assign(newGarageForm, {
        communityName: garage[0],
        projectType: garage[1],
        parkCode: garage[2] === '未配置' ? '' : garage[2],
        marketId: '330102000001',
        location: garageLocations[garage[0]] || '厦门市湖里区',
        businessStatus: garage[4],
        totalSpaces,
        rentedSpaces,
        maintenanceSpaces: String(Math.max(0, Number(totalSpaces) - Number(rentedSpaces) - Number(availableSpaces))),
        availableSpaces,
        servicePhone: '0592-12345678',
        serviceWechat: 'anshang-kefu',
        serviceHours: '工作日 09:00-18:00',
        serviceDescription: '可咨询月租办理、退款和通行异常等问题。',
        serviceEnabled: '启用',
        monthlyAmount: '400',
        quarterlyAmount: '1140',
        halfYearAmount: '2160',
        yearlyAmount: '4080',
        dailyAmount: '14',
        monthlyReceiver: '安商房运营公司',
        monthlyMerchantId: 'MKT3301020001',
        monthlyResponsible: '刘经理',
        monthlyResponsiblePhone: '0571-88990011',
        monthlyBankAccount: '622288880010',
        propertyAmount: garage[1] === '公司自营项目' ? '60' : '',
        propertyReceiver: garage[1] === '公司自营项目' ? '锦绣物业服务有限公司' : '',
        propertyMerchantId: garage[1] === '公司自营项目' ? 'MKT3301020038' : '',
        propertyResponsible: garage[1] === '公司自营项目' ? '陈经理' : '',
        propertyResponsiblePhone: garage[1] === '公司自营项目' ? '0571-88990022' : '',
        propertyBankAccount: garage[1] === '公司自营项目' ? '622288880038' : ''
      });
      const saved = garageConfigs[name];
      createFeeItems = orderFeeItems(saved?.feeItems?.map(item => ({ ...item })) || [
        defaultMonthlyFeeItem(),
        { key: 'propertyAmount', label: '物业费', required: false, optional: true, placeholder: '请输入物业费金额', receiverKey: 'propertyReceiver', merchantKey: 'propertyMerchantId', responsibleKey: 'propertyResponsible', responsiblePhoneKey: 'propertyResponsiblePhone', bankAccountKey: 'propertyBankAccount' }
      ]);
      createNoticeItems = saved?.notices?.map((item, index) => ({ ...item, sort: item.sort ?? index + 1 })) || [
        { id: 0, name: '月租车办理告知书', file: '月租车办理告知书.pdf', sort: 1 },
        { id: 1, name: '物业服务告知书', file: '物业服务告知书.pdf', sort: 2 }
      ];
      if (saved?.form) Object.assign(newGarageForm, saved.form);
      customFeeSeed = saved?.customFeeSeed ?? 0;
      noticeSeed = saved?.noticeSeed ?? Math.max(2, ...createNoticeItems.map(item => Number(item.id) + 1));
      createErrors = {};
      availableSpacesManual = false;
      editingGarageOriginalName = name;
      garageSubpage = 'edit';
      current = 'projects';
      render();
    }
    function openCreateGarage() {
      Object.keys(newGarageForm).forEach(key => { newGarageForm[key] = ''; });
      Object.assign(newGarageForm, {
        communityName: '锦绣安置房示例项目',
        projectType: '公司自营项目',
        parkCode: 'YL-PARK-330102-010',
        marketId: '330102000001',
        location: '厦门市湖里区',
        businessStatus: '可办理',
        totalSpaces: '320',
        rentedSpaces: '246',
        maintenanceSpaces: '8',
        availableSpaces: '66',
        servicePhone: '0592-12345678',
        serviceWechat: 'anshang-kefu',
        serviceHours: '工作日 09:00-18:00',
        serviceDescription: '可咨询月租办理、退款和通行异常等问题。',
        serviceEnabled: '启用',
        monthlyAmount: '400',
        quarterlyAmount: '1140',
        halfYearAmount: '2160',
        yearlyAmount: '4080',
        dailyAmount: '14',
        monthlyReceiver: '安商房运营公司',
        monthlyMerchantId: 'MKT3301020010',
        monthlyResponsible: '刘经理',
        monthlyResponsiblePhone: '0571-88990011',
        monthlyBankAccount: '622288880010',
        propertyAmount: '60',
        propertyReceiver: '锦绣物业服务有限公司',
        propertyMerchantId: 'MKT3301020038',
        propertyResponsible: '陈经理',
        propertyResponsiblePhone: '0571-88990022',
        propertyBankAccount: '622288880038'
      });
      createFeeItems = orderFeeItems([
        defaultMonthlyFeeItem(),
        { key: 'propertyAmount', label: '物业费', required: false, optional: true, placeholder: '请输入物业费金额', receiverKey: 'propertyReceiver', merchantKey: 'propertyMerchantId', responsibleKey: 'propertyResponsible', responsiblePhoneKey: 'propertyResponsiblePhone', bankAccountKey: 'propertyBankAccount' }
      ]);
      customFeeSeed = 0;
      noticeSeed = 1;
      createNoticeItems = [{ id: 0, name: '月租车办理告知书', file: '月租车办理告知书.pdf', sort: 1 }];
      createErrors = {};
      availableSpacesManual = false;
      garageCreateStep = 1;
      garageSubpage = 'create';
      current = 'projects';
      render();
    }
    function createErrorMarkup(key) {
      const message = createErrors[key] || '';
      return `<div class="create-field-error${message ? '' : ' hidden'}" data-error-message="${key}">${message}</div>`;
    }
    function clearCreateError(key) {
      if (!key) return;
      delete createErrors[key];
      const field = document.querySelector(`[data-error-key="${key}"]`);
      if (!field) return;
      field.classList.remove('has-error');
      const message = field.querySelector(`[data-error-message="${key}"]`);
      if (message) {
        message.textContent = '';
        message.classList.add('hidden');
      }
    }
    function setCreateError(key, message) {
      createErrors[key] = message;
    }
    function updateCreateValue(field, value) {
      newGarageForm[field] = value;
      clearCreateError(field);
      if (field === 'availableSpaces') {
        availableSpacesManual = true;
        newGarageForm.businessStatus = value === '' ? '' : Number(value) > 0 ? '可办理' : '已满';
      }
      if (['totalSpaces', 'rentedSpaces', 'maintenanceSpaces'].includes(field)) {
        if (!availableSpacesManual) newGarageForm.availableSpaces = calculateNewGarageAvailableSpaces();
        newGarageForm.businessStatus = newGarageForm.availableSpaces === '' ? '' : Number(newGarageForm.availableSpaces) > 0 ? '可办理' : '已满';
        const available = document.getElementById('createAvailableSpaces');
        if (available) available.value = newGarageForm.availableSpaces;
      }
    }
    function calculateNewGarageAvailableSpaces() {
      const total = Number(newGarageForm.totalSpaces);
      const rented = Number(newGarageForm.rentedSpaces);
      const maintenance = Number(newGarageForm.maintenanceSpaces);
      if ([newGarageForm.totalSpaces, newGarageForm.rentedSpaces, newGarageForm.maintenanceSpaces].some(value => value === '')) return '';
      return Math.max(0, total - rented - maintenance);
    }
    function createInput(field, label, options = {}) {
      const type = options.type || 'text';
      const required = options.required ? ' required' : '';
      const placeholder = options.placeholder ? ` placeholder="${options.placeholder}"` : '';
      const readonly = options.readonly ? ' readonly' : '';
      const id = options.id ? ` id="${options.id}"` : '';
      const value = newGarageForm[field] || '';
      const help = options.help ? `<div class="create-help">${options.help}</div>` : '';
      const error = createErrorMarkup(field);
      return `<div class="create-form-field${options.full ? ' full' : ''}${createErrors[field] ? ' has-error' : ''}" data-error-key="${field}"><label class="${required}">${label}</label><input${id} class="form-control" type="${type}" value="${value}"${placeholder}${readonly} oninput="updateCreateValue('${field}', this.value)">${error}${help}</div>`;
    }
    function createFeeCell(key, label, value, options = {}) {
      const type = options.type || 'text';
      const placeholder = options.placeholder || `请输入${label}`;
      const required = options.required ? ' required' : '';
      const error = createErrorMarkup(key);
      return `<div class="create-fee-cell${createErrors[key] ? ' has-error' : ''}" data-error-key="${key}"><label class="${required}">${label}</label><input class="form-control" type="${type}" value="${value || ''}" placeholder="${placeholder}" aria-label="${label}" oninput="updateCreateValue('${key}', this.value)">${error}</div>`;
    }
    function createFeeField(item, index) {
      const value = newGarageForm[item.key] || '';
      const receiver = newGarageForm[item.receiverKey] || '';
      const merchant = newGarageForm[item.merchantKey] || '';
      const responsible = newGarageForm[item.responsibleKey] || '';
      const responsiblePhone = newGarageForm[item.responsiblePhoneKey] || '';
      const bankAccount = newGarageForm[item.bankAccountKey] || '';
      const configured = item.required || !item.optional || [value, receiver, merchant, bankAccount, responsible, responsiblePhone].some(Boolean);
      const required = item.required || configured;
      return `<section class="create-fee-item"><div class="create-fee-item-head"><div class="create-fee-item-title">收费项目 ${index + 1}</div><button class="create-fee-item-remove" type="button" title="删除收费项目" aria-label="删除收费项目" onclick="removeFeeItem(${index})">×</button></div><div class="create-fee-basic-grid"><div class="create-fee-cell${createErrors[`fee-${index}-name`] ? ' has-error' : ''}" data-error-key="fee-${index}-name"><label class="${required ? 'required' : ''}">收费项目名称</label><input class="form-control fee-name" value="${item.label || ''}" placeholder="请输入收费项目名称" aria-label="收费项目名称" oninput="updateFeeLabel(${index}, this.value)">${createErrorMarkup(`fee-${index}-name`)}</div><div class="create-fee-cell${createErrors[`fee-${index}-amount`] ? ' has-error' : ''}" data-error-key="fee-${index}-amount"><label class="${required ? 'required' : ''}">收费金额</label><div class="fee-amount"><input class="form-control" type="number" value="${value}" placeholder="${item.placeholder || '请输入收费金额'}" aria-label="收费金额" oninput="updateCreateValue('${item.key}', this.value); clearCreateError('fee-${index}-amount')"><span class="fee-unit">元/月</span></div>${createErrorMarkup(`fee-${index}-amount`)}</div></div><div class="create-fee-detail-section"><div class="create-fee-detail-grid">${createFeeCell(item.receiverKey, '收款主体名称', receiver, { required })}${createFeeCell(item.merchantKey, '市场商家编号', merchant, { required })}${createFeeCell(item.bankAccountKey, '商家银行账号', bankAccount, { required })}${createFeeCell(item.responsibleKey, '负责人姓名', responsible, { required })}${createFeeCell(item.responsiblePhoneKey, '负责人手机号', responsiblePhone, { required, type: 'tel' })}</div></div></section>`;
    }
    function createFeeGrid() {
      const items = createFeeItems.map((item, index) => createFeeField(item, index)).join('');
      return `<div class="create-fee-grid">${items}${createErrors.fees ? createErrorMarkup('fees') : ''}<div class="create-fee-add-slot"><button class="btn create-add-btn" type="button" onclick="addFeeItem()"><span class="create-add-icon">+</span>新增收费项</button></div></div>`;
    }
    function updateFeeLabel(index, value) {
      if (createFeeItems[index]) createFeeItems[index].label = value;
      clearCreateError(`fee-${index}-name`);
    }
    function addFeeItem() {
      const id = customFeeSeed++;
      const key = `customFee${id}`;
      const receiverKey = `customFeeReceiver${id}`;
      const merchantKey = `customFeeMerchantId${id}`;
      const responsibleKey = `customFeeResponsible${id}`;
      const responsiblePhoneKey = `customFeeResponsiblePhone${id}`;
      const bankAccountKey = `customFeeBankAccount${id}`;
      newGarageForm[key] = '';
      newGarageForm[receiverKey] = '';
      newGarageForm[merchantKey] = '';
      newGarageForm[responsibleKey] = '';
      newGarageForm[responsiblePhoneKey] = '';
      newGarageForm[bankAccountKey] = '';
      createFeeItems.push({ key, label: '其他收费项', placeholder: '请输入收费金额', receiverKey, merchantKey, responsibleKey, responsiblePhoneKey, bankAccountKey });
      render();
    }
    function removeFeeItem(index) {
      const item = createFeeItems[index];
      if (!item) return;
      delete newGarageForm[item.key];
      delete newGarageForm[item.receiverKey];
      delete newGarageForm[item.merchantKey];
      delete newGarageForm[item.responsibleKey];
      delete newGarageForm[item.responsiblePhoneKey];
      delete newGarageForm[item.bankAccountKey];
      createFeeItems.splice(index, 1);
      render();
    }
    function createSelect(field, label, items, options = {}) {
      const required = options.required ? ' required' : '';
      const dropdownId = `create${field[0].toUpperCase()}${field.slice(1)}Dropdown`;
      const triggerId = `${dropdownId}Trigger`;
      const selected = newGarageForm[field] || items[0];
      const optionHtml = items.map(item => `<button type="button" class="select-option${item === selected ? ' active' : ''}" data-value="${item}" onclick="selectCreateOption('${field}', '${item}', '${item}', '${dropdownId}')">${item}</button>`).join('');
      const help = options.help ? `<div class="create-help">${options.help}</div>` : '';
      return `<div class="create-form-field${options.full ? ' full' : ''}${createErrors[field] ? ' has-error' : ''}" data-error-key="${field}"><label class="${required}">${label}</label><div id="${dropdownId}" class="filter-dropdown"><button id="${triggerId}" class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleCreateDropdown('${dropdownId}', event)"><span>${selected}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="select-menu" role="listbox">${optionHtml}</div></div>${createErrorMarkup(field)}${help}</div>`;
    }
    function createNoticeFileField(index, file) {
      const inputId = `noticeUpload${createNoticeItems[index]?.id ?? index}`;
      const fileNameId = `noticeFileName${createNoticeItems[index]?.id ?? index}`;
      const errorKey = `notice-${createNoticeItems[index]?.id ?? index}-file`;
      return `<div class="create-form-field notice-file-field${createErrors[errorKey] ? ' has-error' : ''}" data-error-key="${errorKey}"><label class="required">告知书文件</label><label class="create-file-picker" for="${inputId}"><span id="${fileNameId}" class="create-file-name">${file || '请选择文件'}</span><span class="create-file-action">选择文件</span></label><input id="${inputId}" type="file" onchange="updateNoticeValue(${index}, 'file', this.files[0] ? this.files[0].name : '')">${createErrorMarkup(errorKey)}<div class="create-help">支持 PDF、图片或 Word 文件。</div></div>`;
    }
    function createNoticeField(item, index, displayIndex) {
      const nameKey = `notice-${item.id}-name`;
      const sortKey = `notice-${item.id}-sort`;
      return `<section class="create-notice-item"><div class="create-notice-item-head"><div class="create-notice-item-title">告知书 ${displayIndex + 1}</div><button class="create-notice-item-remove" type="button" title="删除告知书" aria-label="删除告知书" onclick="removeNoticeItem(${index})">×</button></div><div class="create-form-grid">${createInputValue(`noticeName${item.id}`, '告知书名称', item.name, `updateNoticeValue(${index}, 'name', this.value)`, true, nameKey)}${createInputValue(`noticeSort${item.id}`, '排序', item.sort, `updateNoticeValue(${index}, 'sort', this.value)`, true, sortKey, { type: 'number', placeholder: '请输入排序' })}${createNoticeFileField(index, item.file)}</div></section>`;
    }
    function createInputValue(id, label, value, handler, required = false, errorKey = id, options = {}) {
      const type = options.type || 'text';
      const placeholder = options.placeholder || `请输入${label}`;
      return `<div class="create-form-field${createErrors[errorKey] ? ' has-error' : ''}" data-error-key="${errorKey}"><label class="${required ? 'required' : ''}">${label}</label><input id="${id}" class="form-control" type="${type}" value="${value || ''}" placeholder="${placeholder}" oninput="${handler}">${createErrorMarkup(errorKey)}</div>`;
    }
    function createNoticeGrid() {
      const items = createNoticeItems
        .map((item, index) => ({ item, index }))
        .sort((a, b) => (Number(a.item.sort) || a.index + 1) - (Number(b.item.sort) || b.index + 1) || a.item.id - b.item.id)
        .map(({ item, index }, displayIndex) => createNoticeField(item, index, displayIndex))
        .join('');
      return `<div class="create-notice-grid">${items}<div class="create-notice-add-slot"><button class="btn create-add-btn" type="button" onclick="addNoticeItem()"><span class="create-add-icon">+</span>新增告知书</button></div></div>`;
    }
    function updateNoticeValue(index, field, value) {
      if (!createNoticeItems[index]) return;
      createNoticeItems[index][field] = value;
      clearCreateError(`notice-${createNoticeItems[index].id}-${field}`);
      if (field === 'file') {
        const itemId = createNoticeItems[index].id;
        const fileName = document.getElementById(`noticeFileName${itemId}`);
        if (fileName) fileName.textContent = value || '请选择文件';
      }
    }
    function addNoticeItem() {
      const nextSort = Math.max(0, ...createNoticeItems.map(item => Number(item.sort) || 0)) + 1;
      createNoticeItems.push({ id: noticeSeed++, name: '', file: '', sort: nextSort });
      render();
    }
    function removeNoticeItem(index) {
      if (!createNoticeItems[index]) return;
      createNoticeItems.splice(index, 1);
      render();
    }
    const garageCreateStepLabels = ['基本信息', '收费规则', '告知书', '客服渠道'];
    function createStepper() {
      const steps = garageCreateStepLabels;
      return `<div class="create-stepper">${steps.map((label, index) => { const number = index + 1; const state = number < garageCreateStep ? 'done' : number === garageCreateStep ? 'active' : ''; return `<div class="create-step ${state}"><span class="create-step-index">${number}</span><span class="create-step-label">${label}</span></div>`; }).join('')}</div>`;
    }
    function createGaragePage() {
      const stepTitle = garageCreateStepLabels[garageCreateStep - 1];
      let body = '';
      if (garageCreateStep === 1) {
        body = `<div class="create-info"><div>先填写项目基础信息和车位资源。可办理数量会根据车位数据自动带出，也可以人工调整，最终以人工调整值为准。</div></div><h3 class="create-section-title">项目基础信息</h3><div class="create-form-grid create-basic-info-grid">${createInput('communityName','小区名称',{required:true,placeholder:'请输入小区名称'})}${createSelect('projectType','项目类型',['公司自营项目','区财政代管项目'],{required:true})}${createInput('parkCode','一路停车车场编号',{required:true,placeholder:'请输入一路停车平台提供的车场编号'})}${createInput('marketId','清分市场编号',{required:true,placeholder:'请输入清分平台提供的市场编号'})}${createSelect('location','地理位置',['厦门市湖里区','厦门市思明区'],{required:true})}</div><h3 class="create-section-title" style="margin-top:32px">车位资源</h3><div class="create-form-grid">${createInput('totalSpaces','总车位数',{required:true,type:'number',placeholder:'请输入总车位数'})}${createInput('rentedSpaces','已租车位数',{required:true,type:'number',placeholder:'请输入已租车位数'})}${createInput('maintenanceSpaces','维修中车位数',{required:true,type:'number',placeholder:'请输入维修中车位数'})}${createInput('availableSpaces','可办理数量',{type:'number',id:'createAvailableSpaces'})}</div>`;
      } else if (garageCreateStep === 2) {
        body = createFeeGrid();
      } else if (garageCreateStep === 3) {
        body = `<div class="create-info"><div>用户进入月租办理流程后，会按顺序查看并确认这里配置的全部告知书。</div></div><h3 class="create-section-title">告知书配置</h3>${createNoticeGrid()}`;
      } else if (garageCreateStep === 4) {
        body = `<div class="create-info"><div>客服渠道会展示在小程序个人中心、订单详情和退款结果页，保存后随项目一起生效。</div></div><h3 class="create-section-title">客服渠道</h3><div class="create-form-grid">${createInput('servicePhone','客服电话',{required:true,placeholder:'请输入客服电话'})}${createInput('serviceWechat','微信客服入口',{placeholder:'请输入微信号或企业微信客服入口'})}${createInput('serviceHours','服务时间',{required:true,placeholder:'例如：工作日 09:00-18:00'})}${createSelect('serviceEnabled','是否展示',['启用','停用'],{required:true})}${createInput('serviceDescription','服务说明',{placeholder:'可咨询月租办理、退款和通行异常等问题'})}</div>`;
      }
      const foot = garageCreateStep === 1
        ? `<button class="btn" onclick="backToGarage()">取消</button><span class="foot-spacer"></span><button class="btn btn-primary" onclick="nextCreateGarageStep()">下一步</button>`
        : garageCreateStep === garageCreateStepLabels.length
          ? `<button class="btn" onclick="previousCreateGarageStep()">上一步</button><span class="foot-spacer"></span><button class="btn btn-primary" onclick="saveNewGarage()">保存</button>`
          : `<button class="btn" onclick="previousCreateGarageStep()">上一步</button><span class="foot-spacer"></span><button class="btn btn-primary" onclick="nextCreateGarageStep()">下一步</button>`;
      return `${innerPageHead('新增小区项目')}<section class="create-flow"><div class="create-flow-head"><h2 class="create-flow-title">${stepTitle}</h2></div>${createStepper()}<div class="create-step-panel">${body}</div><div class="create-flow-foot">${foot}</div></section>`;
    }
    function hasCreateValue(value) { return String(value ?? '').trim() !== ''; }
    function validateCreateStep(step, renderErrors = true, resetErrors = true) {
      if (resetErrors) createErrors = {};
      let valid = true;
      const required = (key, label, value) => {
        if (!hasCreateValue(value)) {
          setCreateError(key, `请输入${label}`);
          valid = false;
        }
      };
      const nonNegativeInteger = (key, label, value, requiredField = true) => {
        if (!hasCreateValue(value)) {
          if (requiredField) required(key, label, value);
          return;
        }
        const number = Number(value);
        if (!Number.isInteger(number) || number < 0) {
          setCreateError(key, `${label}必须是大于等于0的整数`);
          valid = false;
        }
      };
      const positiveAmount = (key, label, value) => {
        if (!hasCreateValue(value)) {
          required(key, label, value);
          return;
        }
        const number = Number(value);
        if (!Number.isFinite(number) || number <= 0) {
          setCreateError(key, `${label}必须大于0`);
          valid = false;
        }
      };
      if (step === 1) {
        required('communityName', '小区名称', newGarageForm.communityName);
        required('projectType', '项目类型', newGarageForm.projectType);
        required('parkCode', '一路停车车场编号', newGarageForm.parkCode);
        required('marketId', '清分市场编号', newGarageForm.marketId);
        required('location', '地理位置', newGarageForm.location);
        nonNegativeInteger('totalSpaces', '总车位数', newGarageForm.totalSpaces);
        nonNegativeInteger('rentedSpaces', '已租车位数', newGarageForm.rentedSpaces);
        nonNegativeInteger('maintenanceSpaces', '维修中车位数', newGarageForm.maintenanceSpaces);
        nonNegativeInteger('availableSpaces', '可办理数量', newGarageForm.availableSpaces);
        if (['totalSpaces', 'rentedSpaces', 'maintenanceSpaces'].every(key => hasCreateValue(newGarageForm[key]))) {
          const total = Number(newGarageForm.totalSpaces);
          const rented = Number(newGarageForm.rentedSpaces);
          const maintenance = Number(newGarageForm.maintenanceSpaces);
          if (rented + maintenance > total) {
            setCreateError('rentedSpaces', '已租车位数与维修中车位数之和不能超过总车位数');
            setCreateError('maintenanceSpaces', '已租车位数与维修中车位数之和不能超过总车位数');
            valid = false;
          }
        }
        if (hasCreateValue(newGarageForm.availableSpaces) && hasCreateValue(newGarageForm.totalSpaces) && Number(newGarageForm.availableSpaces) > Number(newGarageForm.totalSpaces)) {
          setCreateError('availableSpaces', '可办理数量不能超过总车位数');
          valid = false;
        }
      } else if (step === 2) {
        if (!createFeeItems.length) {
          setCreateError('fees', '至少保留一个收费项');
          valid = false;
        }
        createFeeItems.forEach((item, index) => {
          const values = [item.key, item.receiverKey, item.merchantKey, item.bankAccountKey, item.responsibleKey, item.responsiblePhoneKey].map(key => newGarageForm[key]);
          const configured = item.required || !item.optional || values.some(hasCreateValue);
          if (!configured) return;
          required(`fee-${index}-name`, '收费项目名称', item.label);
          positiveAmount(`fee-${index}-amount`, `${item.label || '收费项目'}收费金额`, newGarageForm[item.key]);
          required(item.receiverKey, '收款主体名称', newGarageForm[item.receiverKey]);
          required(item.merchantKey, '市场商家编号', newGarageForm[item.merchantKey]);
          required(item.bankAccountKey, '商家银行账号', newGarageForm[item.bankAccountKey]);
          required(item.responsibleKey, '负责人姓名', newGarageForm[item.responsibleKey]);
          required(item.responsiblePhoneKey, '负责人手机号', newGarageForm[item.responsiblePhoneKey]);
          if (hasCreateValue(newGarageForm[item.responsiblePhoneKey])) {
            const phone = String(newGarageForm[item.responsiblePhoneKey]).trim();
            if (!/^(1\d{10}|0\d{2,3}-?\d{7,8})$/.test(phone)) {
              setCreateError(item.responsiblePhoneKey, '请输入正确的负责人手机号或座机号');
              valid = false;
            }
          }
        });
      } else if (step === 3) {
        if (!createNoticeItems.length) {
          setCreateError('notices', '至少保留一份告知书');
          valid = false;
        }
        createNoticeItems.forEach((item, index) => {
          required(`notice-${item.id}-name`, `第${index + 1}份告知书名称`, item.name);
          nonNegativeInteger(`notice-${item.id}-sort`, `第${index + 1}份告知书排序`, item.sort);
          if (hasCreateValue(item.sort) && Number(item.sort) < 1) {
            setCreateError(`notice-${item.id}-sort`, '排序必须从1开始');
            valid = false;
          }
          required(`notice-${item.id}-file`, `第${index + 1}份告知书文件`, item.file);
        });
      } else if (step === 4) {
        required('servicePhone', '客服电话', newGarageForm.servicePhone);
        required('serviceHours', '服务时间', newGarageForm.serviceHours);
        required('serviceEnabled', '是否展示', newGarageForm.serviceEnabled);
        if (hasCreateValue(newGarageForm.servicePhone)) {
          const servicePhone = String(newGarageForm.servicePhone).trim();
          if (!/^(1\d{10}|0\d{2,3}-?\d{7,8}|400-?\d{3}-?\d{4})$/.test(servicePhone)) {
            setCreateError('servicePhone', '请输入正确的客服电话，例如 0592-12345678');
            valid = false;
          }
        }
      }
      if (!valid && renderErrors) render();
      return valid;
    }
    function nextCreateGarageStep() {
      if (!validateCreateStep(garageCreateStep)) return;
      garageCreateStep = Math.min(garageCreateStepLabels.length, garageCreateStep + 1);
      render();
    }
    function previousCreateGarageStep() { garageCreateStep = Math.max(1, garageCreateStep - 1); render(); }
    function saveNewGarage() {
      if (!validateAllGarageForm()) {
        const invalidStep = firstInvalidGarageStep();
        if (invalidStep) garageCreateStep = invalidStep;
        render();
        return;
      }
      const available = newGarageForm.availableSpaces || calculateNewGarageAvailableSpaces();
      const row = [
        newGarageForm.communityName,
        newGarageForm.projectType,
        newGarageForm.parkCode,
        `${newGarageForm.totalSpaces} / ${newGarageForm.rentedSpaces} / ${available}`,
        newGarageForm.businessStatus || (Number(available) > 0 ? '可办理' : '已满'),
        '草稿'
      ];
      const existingIndex = garages.findIndex(garage => garage[0] === newGarageForm.communityName);
      if (existingIndex >= 0) garages[existingIndex] = row;
      else garages.unshift(row);
      garageConfigs[newGarageForm.communityName] = {
        form: { ...newGarageForm },
        feeItems: createFeeItems.map(item => ({ ...item })),
        notices: createNoticeItems.map(item => ({ ...item })),
        customFeeSeed,
        noticeSeed
      };
      selectedGarageName = newGarageForm.communityName;
      garageSubpage = 'list';
      current = 'projects';
      createErrors = {};
      render();
    }
    function firstInvalidGarageStep() {
      const snapshot = createErrors;
      let target = 1;
      for (let step = 1; step <= garageCreateStepLabels.length; step += 1) {
        if (!validateCreateStep(step, false, true)) { target = step; break; }
      }
      createErrors = snapshot;
      return target;
    }
    function validateAllGarageForm() {
      createErrors = {};
      for (let step = 1; step <= garageCreateStepLabels.length; step += 1) {
        validateCreateStep(step, false, false);
      }
      const duplicate = hasCreateValue(newGarageForm.communityName)
        && garages.some(garage => garage[0] === newGarageForm.communityName && garage[0] !== editingGarageOriginalName);
      if (duplicate) setCreateError('communityName', '小区名称已存在，请更换名称');
      return Object.keys(createErrors).length === 0;
    }
    function saveEditedGarage() {
      if (!validateAllGarageForm()) {
        render();
        return;
      }
      const available = newGarageForm.availableSpaces || calculateNewGarageAvailableSpaces();
      const index = garages.findIndex(garage => garage[0] === editingGarageOriginalName);
      if (index < 0) {
        backToGarage();
        return;
      }
      const previous = garages[index];
      garages[index] = [
        newGarageForm.communityName,
        newGarageForm.projectType,
        newGarageForm.parkCode,
        `${newGarageForm.totalSpaces} / ${newGarageForm.rentedSpaces} / ${available}`,
        Number(available) > 0 ? '可办理' : '已满',
        previous[5]
      ];
      if (editingGarageOriginalName !== newGarageForm.communityName) delete garageConfigs[editingGarageOriginalName];
      garageConfigs[newGarageForm.communityName] = {
        form: { ...newGarageForm },
        feeItems: createFeeItems.map(item => ({ ...item })),
        notices: createNoticeItems.map(item => ({ ...item })),
        customFeeSeed,
        noticeSeed
      };
      selectedGarageName = newGarageForm.communityName;
      editingGarageOriginalName = '';
      garageSubpage = 'list';
      current = 'projects';
      createErrors = {};
      render();
    }
    function publishGarage(name) {
      const garage = garages.find(row => row[0] === name);
      if (!garage || garage[5] === '已发布') return;
      if (!String(garage[2] || '').trim() || garage[2] === '未配置') {
        showModal('暂不能发布', '请先补充一路停车车场编号，保存项目后才能发布到小程序。');
        return;
      }
      const publishConfig = garageDetailConfig(garage);
      if (!Number.isFinite(Number(publishConfig.form?.monthlyAmount)) || Number(publishConfig.form.monthlyAmount) <= 0) {
        showModal('暂不能发布', '请先补充月租车费，月租金额为项目必填项，保存项目后才能发布到小程序。');
        return;
      }
      showModal('发布项目', `<div class="project-status-icon" aria-hidden="true">i</div><div>确认发布“${name}”项目吗？发布后用户端将展示该项目的月租办理入口。</div>`);
      document.querySelector('#modalMask .modal')?.classList.add('project-status-modal');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '确认发布';
        confirmButton.onclick = () => {
          garage[5] = '已发布';
          garage[4] = Number(String(garage[3]).split('/').pop().trim()) > 0 ? '可办理' : '已满';
          hideModal();
          render();
        };
      }
    }
    function takeDownGarage(name) {
      const garage = garages.find(row => row[0] === name);
      if (!garage || garage[5] !== '已发布') return;
      showModal('停用确认', `<div class="project-status-icon" aria-hidden="true">!</div><div>停用“${name}”后，用户端将不再展示新的月租办理入口，历史订单、通行记录和财务记录继续保留。</div>`);
      document.querySelector('#modalMask .modal')?.classList.add('project-status-modal', 'project-stop-modal');
      const confirmButton = document.getElementById('modalConfirmButton');
      if (confirmButton) {
        confirmButton.textContent = '确认停用';
        confirmButton.onclick = () => {
          garage[4] = '暂停办理';
          garage[5] = '已下架';
          hideModal();
          render();
        };
      }
    }
    function garageActions(row) {
      const publishAction = row[5] === '草稿'
        ? `<button class="btn-text" onclick="publishGarage('${row[0]}')">发布</button>`
        : row[5] === '已发布'
          ? `<button class="btn-text danger" onclick="takeDownGarage('${row[0]}')">停用</button>`
          : `<button class="btn-text" onclick="publishGarage('${row[0]}')">重新发布</button>`;
      return `<button class="btn-text" onclick="openGarageDetail('${row[0]}')">详情</button><button class="btn-text" onclick="openGarageEdit('${row[0]}')">编辑</button>${publishAction}`;
    }
    function garageTableHtml(rows) {
      const displayRows = rows.map(row => {
        const [total, rented, available] = row[3].split('/').map(value => value.trim());
        return [row[0], row[1], row[2], total, available, row[5]];
      });
      return table([['小区名称','180px'],['项目类型','170px'],['一路停车车场编号','220px'],['总车位','100px'],['可办理数量','120px'],['发布状态','110px'],['操作','170px']], displayRows, garageActions);
    }
    function filterGarages() {
      const keyword = document.getElementById('garageKeyword')?.value.trim().toLowerCase() || '';
      const projectType = selectedGarageProjectType;
      const publishStatus = selectedGaragePublishStatus;
      const rows = garages.filter(row => {
        const keywordMatches = !keyword || row[0].toLowerCase().includes(keyword);
        return keywordMatches && (!projectType || row[1] === projectType) && (!publishStatus || row[5] === publishStatus);
      });
      const tableWrap = document.getElementById('garageTable');
      if (tableWrap) tableWrap.innerHTML = garageTableHtml(rows);
    }
    function resetGarageFilters() {
      const keyword = document.getElementById('garageKeyword');
      const projectTypeLabel = document.getElementById('garageProjectTypeLabel');
      const publishStatusLabel = document.getElementById('garagePublishStatusLabel');
      if (keyword) keyword.value = '';
      selectedGarageProjectType = '';
      selectedGaragePublishStatus = '';
      if (projectTypeLabel) projectTypeLabel.textContent = '全部项目类型';
      if (publishStatusLabel) publishStatusLabel.textContent = '全部发布状态';
      syncGarageProjectOptions();
      syncGaragePublishStatusOptions();
      filterGarages();
    }
    function syncGarageProjectOptions() {
      document.querySelectorAll('#garageProjectMenu .select-option').forEach(option => {
        option.classList.toggle('active', option.dataset.value === selectedGarageProjectType);
      });
    }
    function toggleGarageProjectMenu(event) {
      event.stopPropagation();
      const dropdown = document.getElementById('garageProjectDropdown');
      const isOpen = dropdown.classList.toggle('open');
      document.getElementById('garageProjectTrigger').setAttribute('aria-expanded', String(isOpen));
      if (isOpen) syncGarageProjectOptions();
    }
    function toggleCreateDropdown(id, event) {
      event.stopPropagation();
      document.querySelectorAll('.create-form-field .filter-dropdown').forEach(dropdown => {
        if (dropdown.id !== id) dropdown.classList.remove('open');
      });
      const dropdown = document.getElementById(id);
      const trigger = dropdown?.querySelector('.select-trigger');
      const isOpen = dropdown?.classList.toggle('open');
      if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
    }
    function selectCreateOption(field, value, label, dropdownId) {
      updateCreateValue(field, value);
      const dropdown = document.getElementById(dropdownId);
      if (!dropdown) return;
      const trigger = dropdown.querySelector('.select-trigger');
      const labelNode = trigger?.querySelector('span');
      if (labelNode) labelNode.textContent = label;
      dropdown.querySelectorAll('.select-option').forEach(option => option.classList.toggle('active', option.dataset.value === value));
      dropdown.classList.remove('open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
    function selectGarageProject(value, label) {
      selectedGarageProjectType = value;
      document.getElementById('garageProjectTypeLabel').textContent = label;
      document.getElementById('garageProjectDropdown').classList.remove('open');
      document.getElementById('garageProjectTrigger').setAttribute('aria-expanded', 'false');
      syncGarageProjectOptions();
      filterGarages();
    }
    function toggleGaragePublishStatusMenu(event) {
      event.stopPropagation();
      const dropdown = document.getElementById('garagePublishStatusDropdown');
      const isOpen = dropdown.classList.toggle('open');
      document.getElementById('garagePublishStatusTrigger').setAttribute('aria-expanded', String(isOpen));
      if (isOpen) syncGaragePublishStatusOptions();
    }
    function selectGaragePublishStatus(value, label) {
      selectedGaragePublishStatus = value;
      document.getElementById('garagePublishStatusLabel').textContent = label;
      document.getElementById('garagePublishStatusDropdown').classList.remove('open');
      document.getElementById('garagePublishStatusTrigger').setAttribute('aria-expanded', 'false');
      syncGaragePublishStatusOptions();
      filterGarages();
    }
    function syncGaragePublishStatusOptions() {
      document.querySelectorAll('#garagePublishStatusMenu .select-option').forEach(option => {
        option.classList.toggle('active', option.dataset.value === selectedGaragePublishStatus);
      });
    }
    function toggleFilterDropdown(event, id) {
      event.stopPropagation();
      const dropdown = document.getElementById(id);
      if (!dropdown) return;
      const isOpen = dropdown.classList.toggle('open');
      document.querySelectorAll('.filter-dropdown').forEach(item => {
        if (item !== dropdown) item.classList.remove('open');
        const trigger = item.querySelector('.select-trigger');
        if (trigger && item !== dropdown) trigger.setAttribute('aria-expanded', 'false');
      });
      dropdown.querySelector('.select-trigger').setAttribute('aria-expanded', String(isOpen));
    }
    function selectFilterOption(event, id) {
      event.stopPropagation();
      const option = event.currentTarget;
      const dropdown = document.getElementById(id);
      if (!dropdown) return;
      dropdown.dataset.value = option.dataset.value !== undefined ? option.dataset.value : (option.textContent === '全部' ? '' : option.textContent);
      dropdown.querySelector('.select-trigger span').textContent = option.textContent;
      dropdown.querySelectorAll('.select-option').forEach(item => item.classList.toggle('active', item === option));
      dropdown.classList.remove('open');
      dropdown.querySelector('.select-trigger').setAttribute('aria-expanded', 'false');
      const action = dropdown.dataset.filterAction;
      if (action && typeof window[action] === 'function') window[action]();
    }
    function resetFilterDropdown(id) {
      const dropdown = document.getElementById(id);
      if (!dropdown) return;
      const firstOption = dropdown.querySelector('.select-option');
      dropdown.dataset.value = '';
      dropdown.classList.remove('open');
      const trigger = dropdown.querySelector('.select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (firstOption && trigger) {
        trigger.querySelector('span').textContent = firstOption.textContent;
        dropdown.querySelectorAll('.select-option').forEach(option => option.classList.toggle('active', option === firstOption));
      }
    }
    function defaultGarageDetailConfig(garage) {
      const companyProject = garage[1] === '公司自营项目';
      return {
        form: {
          location: garageLocations[garage[0]] || '厦门市湖里区',
          marketId: '330102000001',
          monthlyAmount: '400',
          quarterlyAmount: '1140',
          halfYearAmount: '2160',
          yearlyAmount: '4080',
          dailyAmount: '14',
          propertyAmount: companyProject ? '60' : '',
          monthlyResponsible: '刘经理',
          propertyResponsible: companyProject ? '陈经理' : '',
          servicePhone: '0592-12345678',
          serviceWechat: 'anshang-kefu',
          serviceHours: '工作日 09:00-18:00',
          serviceDescription: '可咨询月租办理、退款和通行异常等问题。',
          serviceEnabled: '启用'
        },
        feeItems: [
          { key: 'monthlyAmount', label: '月租车费', responsibleKey: 'monthlyResponsible' },
          { key: 'propertyAmount', label: '物业费', optional: true, responsibleKey: 'propertyResponsible' }
        ],
        notices: [
          { id: 0, name: '月租车办理告知书', file: '月租车办理告知书.pdf', sort: 1 },
          { id: 1, name: '物业服务告知书', file: '物业服务告知书.pdf', sort: 2 }
        ]
      };
    }
    function garageDetailConfig(garage) {
      return garageConfigs[garage[0]] || defaultGarageDetailConfig(garage);
    }
    function formatFeeAmount(value) {
      const amount = Number(value);
      return Number.isFinite(amount) && amount > 0 ? `¥${amount.toFixed(2)} / 月` : '未配置';
    }
    function formatFeeSplit(value, total) {
      const amount = Number(value);
      return total > 0 && Number.isFinite(amount) && amount > 0 ? `${(amount / total * 100).toFixed(2)}%` : '未配置';
    }
    function garageDetailPage() {
      const garage = selectedGarage();
      const [totalSpaces, rentedSpaces, availableSpaces] = garage[3].split('/').map(value => value.trim());
      const config = garageDetailConfig(garage);
      const form = config.form || {};
      const maintenance = form.maintenanceSpaces || '8';
      const feeItems = (config.feeItems || []).filter(item => item.required || !item.optional || Number(form[item.key]) > 0 || Object.keys(form).some(key => key === item.receiverKey && hasCreateValue(form[key])));
      const totalFee = feeItems.reduce((sum, item) => sum + (Number(form[item.key]) > 0 ? Number(form[item.key]) : 0), 0);
      const feeRows = feeItems.map(item => ({
        name: item.label || '未命名收费项',
        amount: formatFeeAmount(form[item.key]),
        split: formatFeeSplit(form[item.key], totalFee),
        owner: form[item.responsibleKey] || '未配置'
      }));
      const notices = (config.notices || []).slice().sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0) || a.id - b.id);
      return innerPageHead(`${garage[0]}详情`) + `<section class="detail-page-section"><h3 class="detail-page-title">基本信息</h3><div class="detail-info-grid">${infoItem('小区名称', garage[0])}${infoItem('项目类型', garage[1])}${infoItem('地理位置', form.location || '未配置')}${infoItem('一路停车车场编号', garage[2])}${infoItem('清分市场编号', form.marketId || '未配置')}${infoItem('发布状态', tag(garage[5]))}${infoItem('办理状态', tag(garage[4]))}${infoItem('总车位数', totalSpaces)}${infoItem('已租车位数', rentedSpaces)}${infoItem('维修中车位数', maintenance)}${infoItem('可办理数量', availableSpaces)}${infoItem('最后编辑', '超级管理员 · 2026-08-28 13:40')}</div></section><section class="detail-page-section"><h3 class="detail-page-title">收费与结算</h3><div class="detail-fee-list">${feeRows.map(detailFeeItem).join('')}</div></section><section class="detail-page-section"><h3 class="detail-page-title">项目告知书</h3><div class="detail-notice-list">${notices.map(item => detailNoticeItem(item.name, item.file)).join('')}</div></section><section class="detail-page-section"><h3 class="detail-page-title">客服渠道</h3><div class="detail-info-grid">${infoItem('客服电话', form.servicePhone || '未配置')}${infoItem('微信客服', form.serviceWechat || '未配置')}${infoItem('服务时间', form.serviceHours || '未配置')}${infoItem('是否展示', tag(form.serviceEnabled || '停用'))}${infoItem('服务说明', form.serviceDescription || '未配置')}</div></section>`;
    }

    function garageEditPage() {
      const garage = selectedGarage();
      return `${innerPageHead(`${garage[0]}编辑`)}<section class="create-flow edit-create-flow"><div class="create-step-panel edit-create-panel"><div class="create-info"><div>编辑项目基础信息、车位数据、收费规则、告知书和客服渠道，保存前会校验所有必填项及数据格式。</div></div><h3 class="create-section-title">项目基础信息</h3><div class="create-form-grid create-basic-info-grid">${createInput('communityName','小区名称',{required:true,placeholder:'请输入小区名称'})}${createSelect('projectType','项目类型',['公司自营项目','区财政代管项目'],{required:true})}${createInput('parkCode','一路停车车场编号',{required:true,placeholder:'请输入一路停车平台提供的车场编号'})}${createInput('marketId','清分市场编号',{required:true,placeholder:'请输入清分平台提供的市场编号'})}${createSelect('location','地理位置',['厦门市湖里区','厦门市思明区'],{required:true})}${createInput('totalSpaces','总车位数',{required:true,type:'number',placeholder:'请输入总车位数'})}${createInput('rentedSpaces','已租车位数',{required:true,type:'number',placeholder:'请输入已租车位数'})}${createInput('maintenanceSpaces','维修中车位数',{required:true,type:'number',placeholder:'请输入维修中车位数'})}${createInput('availableSpaces','可办理数量',{type:'number',id:'createAvailableSpaces',help:'系统按总车位数 - 已租车位数 - 维修中车位数自动带出，手动修改后以修改值为准。'})}</div><h3 class="create-section-title edit-module-title">收费规则</h3>${createFeeGrid()}<h3 class="create-section-title edit-module-title">告知书配置</h3><div class="create-info"><div>用户进入月租办理流程后，会按顺序查看并确认这里配置的全部告知书。</div></div>${createNoticeGrid()}<h3 class="create-section-title edit-module-title">客服渠道</h3><div class="create-info"><div>客服渠道会展示在小程序个人中心、订单详情和退款结果页。</div></div><div class="create-form-grid">${createInput('servicePhone','客服电话',{required:true,placeholder:'请输入客服电话'})}${createInput('serviceWechat','微信客服入口',{placeholder:'请输入微信号或企业微信客服入口'})}${createInput('serviceHours','服务时间',{required:true,placeholder:'例如：工作日 09:00-18:00'})}${createSelect('serviceEnabled','是否展示',['启用','停用'],{required:true})}${createInput('serviceDescription','服务说明',{placeholder:'可咨询退款和通行异常等问题'})}</div></div><div class="create-flow-foot"><button class="btn" onclick="backToGarage()">取消</button><span class="foot-spacer"></span><button class="btn btn-primary" onclick="saveEditedGarage()">保存</button></div></section>`;
    }
