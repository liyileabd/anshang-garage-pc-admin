    const menuGroups = [
      { label: '', items: [['dashboard','dashboard','数据总览']] },
      { label: '项目管理', items: [['projects','garage','项目管理']] },
      { label: '用户管理', items: [['users','users','用户管理']] },
      { label: '订单管理', items: [['orders','orders','订单查询']] },
      { label: '财务管理', items: [['clearing','pay','支付与清分'],['refunds','refund','退款处理'],['invoices','receipt','开票管理'],['ledger','export','业务台账']] },
      { label: '系统管理', items: [['systemUsers','users','账号管理'],['logs','clipboard','操作日志']] }
    ];
    const menuItems = menuGroups.flatMap(group => group.items);
    let current = 'projects';
    let currentAccountType = '超级管理员';
    let currentLoginName = 'admin';
    let financeMenuExpanded = false;
    let systemMenuExpanded = false;

    const orders = [
      ['AS202608280018','锦绣安置房','王敏','浙A8P62K、浙AD91F8','新办','月租有效','月租有效','已开通','¥1,680.00','USR-王敏-001','发票'],
      ['AS202608280017','文庭商房','陈涛','浙A36M2Q','续费','月租待生效','月租待生效','开通失败','¥960.00','USR-陈涛-002','票据'],
      ['AS202608280016','荣和家园','林静','浙A7H21D','新办','月租待生效','月租待生效','已开通','¥1,200.00','USR-林静-003','发票'],
      ['AS202608280015','锦绣安置房','周伟','浙A92Q8L、浙AF32C1','续费','月租有效','月租有效','已开通','¥2,400.00','USR-周伟-004','发票'],
      ['AS202608280013','文庭商房','何悦','浙A1X38E','新办','月租有效','月租有效','开通失败','¥960.00','USR-何悦-006','票据'],
      ['AS202608270012','锦绣安置房','王敏','浙A8P62K','续费','退款申请中','月租有效','已开通','¥960.00','USR-王敏-001','发票'],
      ['AS202608120009','荣和家园','周伟','浙AF32C1','新办','退款申请中','月租有效','已开通','¥860.00','USR-周伟-004','发票'],
      ['AS202608260010','文庭商房','李媛','浙A9L63Q','新办','已终止','月租已终止','通行失效','¥1,080.00','USR-李媛-008','票据'],
      ['AS202507180021','锦绣安置房','王敏','浙A8P62K','新办','已结束','月租已过期','通行失效','¥1,200.00','USR-王敏-001','发票'],
    ];
    const orderInvoiceStatus = {
      AS202608280018: '已完成',
      AS202608270012: '已完成',
      AS202608260010: '已完成'
    };
    const orderInvoiceApplications = {};
    const originalOrderLinks = {
      AS202608280017: 'AS20260812009',
      AS202608280015: 'AS20260718027'
    };

    const passageRecords = [
      {
        id: 'TR202608290021', parkOrderId: 'PARK-20260829-00021', plate: '浙A8P62K', plateColor: '蓝牌', vehicleType: '小型车',
        project: '锦绣安置房', parkNo: 'YL-PARK-330102-001', parkName: '锦绣安置房停车场',
        inTimestamp: '2026-08-29 08:21:14', inDoorNumber: '1号门', inWayNumber: '1号车道', inPicFile: 'jinxiu-in-0829-0821.jpg', inOperator: '设备识别',
        outTimestamp: '2026-08-29 18:06:32', outDoorNumber: '2号门', outWayNumber: '2号车道', outPicFile: 'jinxiu-out-0829-1806.jpg', outOperator: '设备识别',
        fee: '¥12.00', payFee: '¥0.00', couponFee: '¥12.00', passageType: '月租通行', result: '正常', recordStatus: '已出场',
        orderNo: 'AS202608280018', receivedAt: '2026-08-29 18:06:35', exception: '暂无异常'
      },
      {
        id: 'TR202608290018', parkOrderId: 'PARK-20260829-00018', plate: '浙AD91F8', plateColor: '蓝牌', vehicleType: '小型车',
        project: '锦绣安置房', parkNo: 'YL-PARK-330102-001', parkName: '锦绣安置房停车场',
        inTimestamp: '2026-08-29 09:42:08', inDoorNumber: '1号门', inWayNumber: '2号车道', inPicFile: 'jinxiu-in-0829-0942.jpg', inOperator: '设备识别',
        outTimestamp: '', outDoorNumber: '', outWayNumber: '', outPicFile: '', outOperator: '',
        fee: '¥8.00', payFee: '¥8.00', couponFee: '¥0.00', passageType: '临停计费', result: '正常', recordStatus: '场内',
        orderNo: 'AS202608280018', receivedAt: '2026-08-29 09:42:10', exception: '暂无异常'
      },
      {
        id: 'TR202608290016', parkOrderId: 'PARK-20260829-00016', plate: '浙A36M2Q', plateColor: '蓝牌', vehicleType: '小型车',
        project: '文庭商房', parkNo: 'YL-PARK-330102-006', parkName: '文庭商房停车场',
        inTimestamp: '', inDoorNumber: '', inWayNumber: '', inPicFile: '', inOperator: '',
        outTimestamp: '2026-08-29 12:18:44', outDoorNumber: '1号门', outWayNumber: '1号车道', outPicFile: 'wenting-out-0829-1218.jpg', outOperator: '设备识别',
        fee: '¥6.00', payFee: '¥6.00', couponFee: '¥0.00', passageType: '临停计费', result: '异常', recordStatus: '未匹配',
        orderNo: '暂无关联月租订单', receivedAt: '2026-08-29 12:18:46', exception: '收到出场通知，但未找到对应入场记录'
      },
      {
        id: 'TR202608280034', parkOrderId: 'PARK-20260828-00034', plate: '浙A7H21D', plateColor: '新能源', vehicleType: '小型车',
        project: '荣和家园', parkNo: 'YL-PARK-330102-008', parkName: '荣和家园停车场',
        inTimestamp: '2026-08-28 10:16:22', inDoorNumber: '2号门', inWayNumber: '1号车道', inPicFile: 'ronghe-in-0828-1016.jpg', inOperator: '设备识别',
        outTimestamp: '2026-08-28 10:20:03', outDoorNumber: '2号门', outWayNumber: '1号车道', outPicFile: 'ronghe-out-0828-1020.jpg', outOperator: '设备识别',
        fee: '¥10.00', payFee: '¥10.00', couponFee: '¥0.00', passageType: '临停计费', result: '异常', recordStatus: '已出场',
        orderNo: 'AS202608280016', receivedAt: '2026-08-28 10:20:06', exception: '月租权限未开通，平台按临停规则计费'
      }
    ];

    // 业务台账：资金流水。一行 = 一笔资金动作（收款 / 退款）
    // 字段：[发生时间, 业务订单号, 小区项目, 资金动作, 去向账户, 金额, 状态]
    const ledgerEntries = [
      ['2026-08-30 09:40','AS202608270012','锦绣安置房','退款','原路退回车主 · 王敏','-800.00','待审批'],
      ['2026-08-29 09:40','AS202608280017','文庭商房','退款','原路退回车主 · 陈涛','-160.00','已退款'],
      ['2026-08-28 16:40','AS202608280015','锦绣安置房','收款','结算平台 · 待分资金','+2,400.00','已入账'],
      ['2026-08-28 14:05','AS202608280013','文庭商房','收款','结算平台 · 待分资金','+960.00','已入账'],
      ['2026-08-28 11:30','AS202608280017','文庭商房','收款','结算平台 · 待分资金','+960.00','已入账'],
      ['2026-08-28 10:16','AS202608120009','荣和家园','退款','原路退回车主 · 周伟','-860.00','待审批'],
      ['2026-08-28 10:12','AS202608280018','锦绣安置房','收款','结算平台 · 待分资金','+1,680.00','已入账'],
      ['2026-08-28 09:05','AS202608280016','荣和家园','收款','结算平台 · 待分资金','+1,200.00','已入账'],
      ['2026-08-27 14:20','AS202608270012','锦绣安置房','收款','结算平台 · 待分资金','+960.00','已入账'],
      ['2026-08-26 15:20','AS202608260010','文庭商房','收款','结算平台 · 待分资金','+1,080.00','已入账'],
      ['2026-08-12 09:50','AS202608120009','荣和家园','收款','结算平台 · 待分资金','+860.00','已入账'],
      ['2025-07-18 10:30','AS202507180021','锦绣安置房','收款','结算平台 · 待分资金','+1,200.00','已入账']
    ];
    const refunds = [
      ['RF202608280008','AS20260812009','锦绣安置房','周伟','浙A92Q8L','周伟 / 尾号 6219','¥860.00','待审批','通行已开通','车辆出售，提前结束月租','2026-08-28 10:16','','','','','USR-周伟-004'],
      ['RF202608270031','AS20260720018','文庭商房','李媛','浙A9L63Q','李媛 / 尾号 8046','¥220.00','已通过','月租已终止','重复缴纳月租费用','2026-08-27 15:42','','','','','USR-李媛-008'],
      ['RF202608290019','AS202608280017','文庭商房','陈涛','浙A36M2Q','陈涛 / 尾号 4231','¥160.00','已通过','月租已终止','重复缴费核验通过','2026-08-29 09:18','','','','','USR-陈涛-002'],
      ['RF202608260011','AS20260718027','荣和家园','何军','浙A2C87N','何军 / 尾号 1180','¥300.00','已驳回','通行已恢复','申请提前结束月租','2026-08-26 09:30','','','','','USR-何军-009'],
      ['RF202608250006','AS20260815003','锦绣安置房','王敏','浙A8P62K','王敏 / 尾号 2028','¥360.00','已通过','月租已终止','车辆转让，提前结束月租','2026-08-25 14:18','','','','','USR-王敏-001']
    ];
    const refundRequestDetails = {
      RF202608280008: { id: 'REFUND-20260828-0008', requestNo: 'RF202608280008', orderId: 'AS20260812009', userId: 'USR-周伟-004', reason: '车辆已出售，申请退回剩余月租费用', note: '用户已在小程序提交车辆出售说明。', originalPaidAmount: 1080, remainingTerm: '2026-08-12 至 2026-09-11', estimatedAmount: 860, approvedAmount: null, status: '待审批', submittedAt: '2026-08-28 10:16', approvedAt: null, approverId: null, approvalNote: '等待退款审批。' },
      RF202608270031: { id: 'REFUND-20260827-0031', requestNo: 'RF202608270031', orderId: 'AS20260720018', userId: 'USR-李媛-008', reason: '重复缴纳月租费用', note: '客服核验后确认订单存在重复付款。', originalPaidAmount: 1080, remainingTerm: '2026-07-20 至 2026-08-19', estimatedAmount: 220, approvedAmount: 220, status: '已通过', submittedAt: '2026-08-27 15:42', approvedAt: '2026-08-27 16:10', approverId: 'finance01', approvalNote: '审批已通过。' },
      RF202608290019: { id: 'REFUND-20260829-0019', requestNo: 'RF20260829-0019', orderId: 'AS202608280017', userId: 'USR-陈涛-002', reason: '重复缴费核验通过', note: '用户提交重复缴费说明。', originalPaidAmount: 960, remainingTerm: '2026-09-01 至 2027-08-31', estimatedAmount: 160, approvedAmount: 160, status: '已通过', submittedAt: '2026-08-29 09:18', approvedAt: '2026-08-29 09:40', approverId: 'finance01', approvalNote: '退款审批已通过。' },
      RF202608260011: { id: 'REFUND-20260826-0011', requestNo: 'RF202608260011', orderId: 'AS20260718027', userId: 'USR-何军-009', reason: '申请提前结束月租', note: '剩余有效期不足退款规则规定的最小天数。', originalPaidAmount: 300, remainingTerm: '2026-07-18 至 2026-08-17', estimatedAmount: 300, approvedAmount: null, status: '已驳回', submittedAt: '2026-08-26 09:30', approvedAt: '2026-08-26 10:05', approverId: 'finance01', approvalNote: '申请已驳回，月租通行已恢复。' },
      RF202608250006: { id: 'REFUND-20260825-0006', requestNo: 'RF202608250006', orderId: 'AS20260815003', userId: 'USR-王敏-001', reason: '车辆转让，提前结束月租', note: '用户已提交车辆转让说明。', originalPaidAmount: 860, remainingTerm: '2026-08-15 至 2026-09-14', estimatedAmount: 360, approvedAmount: 360, status: '已通过', submittedAt: '2026-08-25 14:18', approvedAt: '2026-08-25 15:00', approverId: 'finance01', approvalNote: '退款审批已通过。' }
    };
    const refundAuditRecords = {
      RF202608270031: { result: '通过', note: '退款审批已通过。' },
      RF202608290019: { result: '通过', note: '退款审批已通过。' },
      RF202608260011: { result: '驳回', note: '剩余有效期不足退款规则规定的最小天数。' },
      RF202608250006: { result: '通过', note: '退款审批已通过。' }
    };

    const rentUsers = [
      {
        userId: 'USR-王敏-001', loginType: 'wechat', openid: 'wx-openid-demo-001', status: 'active',
        name: '王敏', nickname: '敏敏', phone: '138****2028', idCard: '330102********4521', login: '微信登录', createdAt: '2026-03-18 10:20', updatedAt: '2026-08-28 09:24',
        vehicles: [{ id: 'VEH-王敏-浙A8P62K', userId: 'USR-王敏-001', plate: '浙A8P62K', color: '蓝牌', type: '小型车', status: '已绑定' }, { id: 'VEH-王敏-浙AD91F8', userId: 'USR-王敏-001', plate: '浙AD91F8', color: '蓝牌', type: '小型车', status: '已绑定' }],
        refundAccount: { accountType: '银行卡', bankName: '中国建设银行厦门湖里支行', accountNo: '6217 **** **** 2028', accountPhone: '138****2028', isDefault: true, updatedAt: '2026-08-20 15:12' },
        records: [
          { project: '锦绣安置房', orderNo: 'AS202608280018', type: '新办', plates: '浙A8P62K、浙AD91F8', period: '2026-09-01 至 2027-08-31', rentStatus: '月租有效', trafficStatus: '已开通', amount: '¥1,680.00', syncAt: '2026-08-28 09:26', exception: '无' },
          { project: '文庭商房', orderNo: 'AS202608270012', type: '续费', plates: '浙A8P62K', period: '2026-09-01 至 2027-08-31', rentStatus: '月租待生效', trafficStatus: '开通失败', amount: '¥960.00', syncAt: '2026-08-28 11:30', exception: '一路停车平台返回失败，系统待重试' },
          { project: '锦绣安置房', orderNo: 'AS202507180021', type: '新办', plates: '浙A8P62K', period: '2025-08-01 至 2026-07-31', rentStatus: '月租已过期', trafficStatus: '通行失效', amount: '¥1,200.00', syncAt: '2026-08-01 00:05', exception: '无' }
        ]
      },
      {
        userId: 'USR-陈涛-002', loginType: 'sms', openid: null, status: 'active',
        name: '陈涛', nickname: '涛哥', phone: '139****8841', idCard: '330106********1108', login: '验证码登录', createdAt: '2026-04-06 14:16', updatedAt: '2026-08-28 11:08',
        vehicles: [{ id: 'VEH-陈涛-浙A36M2Q', userId: 'USR-陈涛-002', plate: '浙A36M2Q', color: '蓝牌', type: '小型车', status: '已绑定' }],
        refundAccount: null,
        records: [{ project: '文庭商房', orderNo: 'AS202608280017', type: '续费', plates: '浙A36M2Q', period: '2026-09-01 至 2027-08-31', rentStatus: '月租待生效', trafficStatus: '开通失败', amount: '¥960.00', syncAt: '2026-08-28 11:30', exception: '一路停车平台返回失败，系统待重试' }]
      },
      {
        userId: 'USR-林静-003', loginType: 'wechat', openid: 'wx-openid-demo-003', status: 'active',
        name: '林静', nickname: '静待花开', phone: '136****7209', idCard: '330104********0927', login: '微信登录', createdAt: '2026-05-12 09:42', updatedAt: '2026-08-28 10:12',
        vehicles: [{ id: 'VEH-林静-浙A7H21D', userId: 'USR-林静-003', plate: '浙A7H21D', color: '新能源', type: '小型车', status: '已绑定' }],
        refundAccount: { accountType: '银行卡', bankName: '招商银行厦门分行', accountNo: '6214 **** **** 7209', accountPhone: '136****7209', isDefault: true, updatedAt: '2026-08-22 09:30' },
        records: [{ project: '荣和家园', orderNo: 'AS202608280016', type: '新办', plates: '浙A7H21D', period: '2026-09-01 至 2027-08-31', rentStatus: '月租待生效', trafficStatus: '已开通', amount: '¥1,200.00', syncAt: '2026-08-28 10:14', exception: '无' }]
      },
      {
        userId: 'USR-周伟-004', loginType: 'wechat', openid: 'wx-openid-demo-004', status: 'active',
        name: '周伟', nickname: '周先生', phone: '135****6610', idCard: '330102********6730', login: '微信登录', createdAt: '2026-02-21 16:08', updatedAt: '2026-08-28 13:40',
        vehicles: [{ id: 'VEH-周伟-浙A92Q8L', userId: 'USR-周伟-004', plate: '浙A92Q8L', color: '蓝牌', type: '小型车', status: '已绑定' }, { id: 'VEH-周伟-浙AF32C1', userId: 'USR-周伟-004', plate: '浙AF32C1', color: '蓝牌', type: '小型车', status: '已绑定' }],
        refundAccount: { accountType: '银行卡', bankName: '中国工商银行厦门湖里支行', accountNo: '6212 **** **** 6610', accountPhone: '135****6610', isDefault: true, updatedAt: '2026-08-25 14:18' },
        records: [
          { project: '锦绣安置房', orderNo: 'AS202608280015', type: '续费', plates: '浙A92Q8L、浙AF32C1', period: '2026-09-01 至 2027-08-31', rentStatus: '月租有效', trafficStatus: '已开通', amount: '¥2,400.00', syncAt: '2026-08-28 13:42', exception: '无' },
          { project: '荣和家园', orderNo: 'AS20260812009', type: '新办', plates: '浙AF32C1', period: '2026-08-12 至 2027-08-11', rentStatus: '月租有效', trafficStatus: '已开通', amount: '¥860.00', syncAt: '2026-08-20 15:12', exception: '退款审批处理中' }
        ]
      },
      {
        userId: 'USR-赵宁-005', loginType: 'wechat', openid: 'wx-openid-demo-005', status: 'disabled',
        name: '赵宁', nickname: '赵小宁', phone: '137****5142', idCard: '330105********3614', login: '微信登录', createdAt: '2026-06-09 11:35', updatedAt: '2026-08-28 12:06', cancelledAt: '2026-08-20 16:30',
        vehicles: [{ id: 'VEH-赵宁-浙A5K20P', userId: 'USR-赵宁-005', plate: '浙A5K20P', color: '蓝牌', type: '小型车', status: '已绑定' }],
        refundAccount: null,
        records: []
      },
      {
        userId: 'USR-何悦-006', loginType: 'wechat', openid: 'wx-openid-demo-006', status: 'active',
        name: '何悦', nickname: '悦悦', phone: '136****9234', idCard: '暂未填写', login: '微信登录', createdAt: '2026-08-27 17:36', updatedAt: '2026-08-27 17:36',
        vehicles: [{ id: 'VEH-何悦-浙A1X38E', userId: 'USR-何悦-006', plate: '浙A1X38E', color: '蓝牌', type: '小型车', status: '已绑定' }],
        refundAccount: null,
        records: []
      },
      {
        userId: 'USR-杜飞-007', loginType: 'sms', openid: null, status: 'active',
        name: '杜飞', nickname: '飞行日记', phone: '137****1096', idCard: '暂未填写', login: '手机号验证码登录', createdAt: '2026-08-28 15:10', updatedAt: '2026-08-28 15:10',
        vehicles: [],
        refundAccount: null,
        records: []
      }
    ];

    const orderVehicleRelations = orders.flatMap((order, orderIndex) => {
      const owner = rentUsers.find(user => user.records.some(record => record.orderNo === order[0]));
      return String(order[3] || '').split('、').filter(Boolean).map((plate, index) => ({
        id: `OV${String(orderIndex + 1).padStart(3, '0')}${index + 1}`,
        orderId: order[0],
        vehicleId: owner?.vehicles.find(vehicle => vehicle.plate === plate)?.id || `VEH-${owner?.name || order[2]}-${plate}`,
        plateSnapshot: plate,
        sequence: index + 1,
        vehicleRole: index === 0 ? 'primary' : 'secondary',
        status: 'active',
        boundAt: owner?.records.find(record => record.orderNo === order[0])?.syncAt || '2026-08-28 09:00',
        removedAt: null
      }));
    });

    const garages = [
      ['锦绣安置房','公司自营项目','YL-PARK-330102-001','320 / 246 / 66','可办理','已发布'],
      ['文庭商房','区财政代管项目','YL-PARK-330102-006','186 / 171 / 12','可办理','已发布'],
      ['荣和家园','公司自营项目','未配置','240 / 0 / 0','暂停办理','草稿'],
      ['江南新寓','区财政代管项目','YL-PARK-330102-009','150 / 150 / 0','已满','已发布']
    ];
    const garageLocations = {
      '锦绣安置房': '厦门市湖里区',
      '文庭商房': '厦门市思明区',
      '荣和家园': '厦门市湖里区',
      '江南新寓': '厦门市思明区'
    };
    let selectedGarageName = garages[0][0];
    let garageSubpage = 'list';
    let selectedGaragePublishStatus = '';
    let selectedUserName = rentUsers[0].name;
    let userSubpage = 'list';
    let selectedOrderId = orders[0][0];
    let orderSubpage = 'list';
    let selectedPassageId = '';
    let passageSubpage = 'list';
    let selectedRefundId = '';
    let refundSubpage = 'list';
    let invoiceSubpage = 'list';
    let selectedInvoiceId = '';
    let settlementSubpage = 'list';
    let selectedSettlementOrder = '';
    const revealedSensitiveUsers = new Set();
    const sensitiveInfoAuditLogs = [];
    const DEFAULT_INITIAL_PASSWORD = '123456';
    const systemAccounts = [
      ['admin','超级管理员','启用','2026-08-28 09:05'],
      ['finance01','普通账号','启用','2026-08-27 17:30'],
      ['property01','普通账号','启用','2026-08-28 10:18'],
      ['ops02','普通账号','停用','2026-08-20 15:02']
    ];
    // 个人中心：账号资料（登录账号不可改，其余可在个人中心维护）、登录密码、头像
    let currentPassword = DEFAULT_INITIAL_PASSWORD;
    const userProfiles = {
      admin: { company: '安商房运营公司', position: '平台管理员', name: '系统管理员', nickname: '管理员', phone: '13800138000', email: 'admin@anshangfang.com' },
      finance01: { company: '安商房运营公司', position: '财务管理员', name: '张敏', nickname: '张敏', phone: '13800138001', email: 'finance01@anshangfang.com' },
      property01: { company: '安商房运营公司', position: '物业管理员', name: '刘伟', nickname: '刘伟', phone: '13800138002', email: 'property01@anshangfang.com' },
      ops02: { company: '安商房运营公司', position: '运营专员', name: '陈露', nickname: '陈露', phone: '13800138003', email: 'ops02@anshangfang.com' }
    };
    const profileAvatars = {};
    function profileOf(loginName) {
      if (!userProfiles[loginName]) {
        const account = systemAccounts.find(item => item[0] === loginName);
        userProfiles[loginName] = { company: '安商房运营公司', position: account && account[1] === '超级管理员' ? '平台管理员' : '普通管理员', name: loginName, nickname: loginName, phone: '', email: '' };
      }
      return userProfiles[loginName];
    }
    function accountAvatarLetter(loginName) {
      const account = systemAccounts.find(item => item[0] === loginName);
      return account && account[1] === '超级管理员' ? '管' : String(loginName || '').charAt(0).toUpperCase();
    }
    function accountAvatarHtml(loginName, extraClass = '', id = '') {
      const url = profileAvatars[loginName];
      const inner = url ? `<img src="${url}" alt="">` : accountAvatarLetter(loginName);
      return `<span class="avatar${extraClass ? ` ${extraClass}` : ''}"${id ? ` id="${id}"` : ''}>${inner}</span>`;
    }
    let selectedGarageProjectType = '';
    let garageCreateStep = 1;
    const newGarageForm = {
      communityName: '',
      projectType: '公司自营项目',
      parkCode: '',
      marketId: '',
      location: '厦门市湖里区',
      businessStatus: '',
      totalSpaces: '',
      rentedSpaces: '',
      maintenanceSpaces: '',
      availableSpaces: '',
      monthlyAmount: '',
      quarterlyAmount: '',
      halfYearAmount: '',
      yearlyAmount: '',
      dailyAmount: '',
      propertyAmount: '',
      monthlyReceiver: '',
      monthlyMerchantId: '',
      monthlyResponsible: '',
      monthlyResponsiblePhone: '',
      monthlyBankAccount: '',
      propertyReceiver: '',
      propertyMerchantId: '',
      propertyResponsible: '',
      propertyResponsiblePhone: '',
      propertyBankAccount: '',
    };
    let createFeeItems = [
      { key: 'monthlyAmount', label: '月租车费', required: true, placeholder: '请输入月租金额', receiverKey: 'monthlyReceiver', merchantKey: 'monthlyMerchantId', responsibleKey: 'monthlyResponsible', responsiblePhoneKey: 'monthlyResponsiblePhone', bankAccountKey: 'monthlyBankAccount' },
      { key: 'propertyAmount', label: '物业费', required: false, optional: true, placeholder: '请输入物业费金额', receiverKey: 'propertyReceiver', merchantKey: 'propertyMerchantId', responsibleKey: 'propertyResponsible', responsiblePhoneKey: 'propertyResponsiblePhone', bankAccountKey: 'propertyBankAccount' }
    ];
    let customFeeSeed = 0;
    let availableSpacesManual = false;
    let noticeSeed = 0;
    let createNoticeItems = [];
    let createErrors = {};
    let editingGarageOriginalName = '';
    let garageConfigs = {};
