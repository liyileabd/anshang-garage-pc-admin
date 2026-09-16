    function passageById(id) {
      return passageRecords.find(record => record.id === id) || passageRecords[0];
    }
    function passageActions(record) {
      return `<button class="btn-text" onclick="openPassage('${record.id}')">详情</button>`;
    }
    function passageTableHtml(records) {
      const rows = records.map(record => [
        record.plate,
        `__html__${record.project}<br><span class="detail-info-label">${record.parkName}</span>`,
        record.inTimestamp || '暂无入场信息',
        record.outTimestamp || '仍在场内',
        record.passageType,
        record.result,
        record.recordStatus,
        record.id
      ]);
      return table([['车牌号','130px'],['项目/停车场','190px'],['进场时间','170px'],['出场时间','170px'],['通行类型','120px'],['通行结果','100px'],['记录状态','110px'],['记录编号','160px'],['操作','90px']], rows, (row) => passageActions(passageById(row[7])));
    }
    function filterPassages() {
      const keyword = document.getElementById('passageKeyword')?.value.trim().toLowerCase() || '';
      const project = document.getElementById('passageProjectFilter')?.dataset.value || '';
      const result = document.getElementById('passageResultFilter')?.dataset.value || '';
      const status = document.getElementById('passageStatusFilter')?.dataset.value || '';
      const records = passageRecords.filter(record => {
        const keywordMatches = !keyword || [record.plate, record.project, record.parkName, record.id, record.parkOrderId, record.orderNo].some(value => String(value).toLowerCase().includes(keyword));
        return keywordMatches && (!project || record.project === project) && (!result || record.result === result) && (!status || record.recordStatus === status);
      });
      const tableWrap = document.getElementById('passageTable');
      if (tableWrap) tableWrap.innerHTML = passageTableHtml(records);
    }
    function resetPassageFilters() {
      const keyword = document.getElementById('passageKeyword');
      if (keyword) keyword.value = '';
      ['passageProjectFilter', 'passageResultFilter', 'passageStatusFilter'].forEach(resetFilterDropdown);
      filterPassages();
    }
    function openPassage(id) {
      selectedPassageId = id;
      passageSubpage = 'detail';
      current = 'passages';
      render();
    }
    function passageDetailPage() {
      const record = passageById(selectedPassageId);
      const outInfo = record.outTimestamp
        ? `${infoItem('出场时间', record.outTimestamp)}${infoItem('出场门号', record.outDoorNumber)}${infoItem('出场道号', record.outWayNumber)}${infoItem('出场图片', record.outPicFile)}${infoItem('出场操作员', record.outOperator)}`
        : `${infoItem('出场时间', '仍在场内')}${infoItem('出场门号', '暂无出场信息')}${infoItem('出场道号', '暂无出场信息')}${infoItem('出场图片', '暂无出场信息')}${infoItem('出场操作员', '暂无出场信息')}`;
      const orderLink = /^AS/.test(record.orderNo)
        ? `<button class="btn-text" onclick="openOrder('${record.orderNo}')">${record.orderNo}</button>`
        : record.orderNo;
      return `${innerPageHead('通行记录详情', 'backToPassages()')}<section class="detail-page-section"><h3 class="detail-page-title">通行基本信息</h3><div class="detail-info-grid">${infoItem('记录编号', record.id)}${infoItem('车牌号', record.plate)}${infoItem('车牌颜色', record.plateColor)}${infoItem('车辆类型', record.vehicleType)}${infoItem('项目', record.project)}${infoItem('停车场', record.parkName)}${infoItem('车场编号', record.parkNo)}${infoItem('停车场订单号', record.parkOrderId)}${infoItem('通行类型', record.passageType)}${infoItem('通行结果', tag(record.result))}${infoItem('记录状态', tag(record.recordStatus))}</div></section><section class="detail-page-section"><h3 class="detail-page-title">入场信息</h3><div class="detail-info-grid">${infoItem('入场时间', record.inTimestamp || '暂无入场信息')}${infoItem('入场门号', record.inDoorNumber || '暂无入场信息')}${infoItem('入场道号', record.inWayNumber || '暂无入场信息')}${infoItem('入场图片', record.inPicFile || '暂无入场信息')}${infoItem('入场操作员', record.inOperator || '暂无入场信息')}</div></section><section class="detail-page-section"><h3 class="detail-page-title">出场信息</h3><div class="detail-info-grid">${outInfo}</div></section><section class="detail-page-section"><h3 class="detail-page-title">计费信息</h3><div class="detail-info-grid">${infoItem('应收金额', record.fee || '暂无计费信息')}${infoItem('实付金额', record.payFee || '暂无计费信息')}${infoItem('优惠金额', record.couponFee || '暂无计费信息')}</div></section><section class="detail-page-section"><h3 class="detail-page-title">业务关联</h3><div class="detail-info-grid">${infoItem('关联月租订单', orderLink)}${infoItem('接口接收时间', record.receivedAt)}${infoItem('异常说明', record.exception)}</div></section>`;
    }
