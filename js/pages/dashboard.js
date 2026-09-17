    const financeDailyStats = [
      { date: '2026-09-04', newOrders: 24, renewOrders: 35, paidAmount: 16840, actualRefundAmount: 820 },
      { date: '2026-09-03', newOrders: 22, renewOrders: 33, paidAmount: 15460, actualRefundAmount: 1020 },
      { date: '2026-09-02', newOrders: 26, renewOrders: 29, paidAmount: 14980, actualRefundAmount: 600 },
      { date: '2026-09-01', newOrders: 19, renewOrders: 31, paidAmount: 13920, actualRefundAmount: 480 },
      { date: '2026-08-31', newOrders: 28, renewOrders: 38, paidAmount: 18160, actualRefundAmount: 960 },
      { date: '2026-08-30', newOrders: 21, renewOrders: 30, paidAmount: 14240, actualRefundAmount: 720 },
      { date: '2026-08-29', newOrders: 23, renewOrders: 34, paidAmount: 15780, actualRefundAmount: 860 },
      { date: '2026-08-28', newOrders: 31, renewOrders: 37, paidAmount: 19440, actualRefundAmount: 360 },
      { date: '2026-08-27', newOrders: 18, renewOrders: 29, paidAmount: 13260, actualRefundAmount: 540 },
      { date: '2026-08-26', newOrders: 20, renewOrders: 27, paidAmount: 12880, actualRefundAmount: 740 },
      { date: '2026-08-25', newOrders: 25, renewOrders: 32, paidAmount: 15620, actualRefundAmount: 420 },
      { date: '2026-08-24', newOrders: 17, renewOrders: 26, paidAmount: 11980, actualRefundAmount: 680 },
      { date: '2026-08-23', newOrders: 22, renewOrders: 28, paidAmount: 13740, actualRefundAmount: 560 },
      { date: '2026-08-22', newOrders: 16, renewOrders: 24, paidAmount: 10860, actualRefundAmount: 300 }
    ];
    function financeCurrency(value) {
      return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    function financeDateLabel(date) {
      const [, month, day] = date.split('-');
      return `${Number(month)}月${Number(day)}日`;
    }
    function financeDateBefore(date) {
      const value = new Date(`${date}T00:00:00`);
      value.setDate(value.getDate() - 1);
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    }
    function financeChangeHtml(value, previous) {
      if (previous === null || previous === undefined || previous === 0) return '<span class="dashboard-finance-change no-data">—</span>';
      const delta = value - previous;
      if (delta === 0) return '<span class="dashboard-finance-change flat">→ 0.0%</span>';
      return `<span class="dashboard-finance-change ${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '↑' : '↓'} ${Math.abs(delta / previous * 100).toFixed(1)}%</span>`;
    }
    function financeRowForProject(row) {
      const result = { ...row };
      result.paidOrders = result.newOrders + result.renewOrders;
      result.netAmount = result.paidAmount - result.actualRefundAmount;
      return result;
    }

    const dashboardSeries = {
      '新办订单': [18, 22, 20, 27, 31, 29, 34, 25, 24, 28, 32, 36, 30, 33, 37, 31, 39, 35, 42, 38, 44, 41, 46, 43, 49, 45, 51, 48, 53, 50],
      '续费订单': [32, 35, 38, 40, 43, 41, 46, 39, 42, 45, 48, 52, 47, 50, 54, 49, 56, 53, 58, 55, 61, 57, 63, 60, 66, 62, 68, 65, 71, 69]
    };
    const dashboardPendingItems = [
      { type: '通行同步异常', orderNo: 'AS202608280017', user: '陈涛', issue: '等待一路停车平台回执，支持重新同步', submittedAt: '2026-08-28 11:30', action: "openOrder('AS202608280017')", actionLabel: '去处理' },
      { type: '退款待审批', orderNo: 'AS20260812009', user: '周伟', issue: '车辆出售，提前结束月租，预计退款 ¥860.00', submittedAt: '2026-08-28 10:16', action: "openRefund('RF202608280008')", actionLabel: '去审核' },
      { type: '发票待上传', orderNo: 'INV202609080001', user: '王敏', issue: '开票申请待上传票据文件', submittedAt: '2026-09-08 10:00', action: "openFinancePage('invoices')", actionLabel: '去处理' }
    ];
    function dashboardDateParts() {
      const end = new Date('2026-09-04T00:00:00');
      const start = new Date(end);
      start.setDate(end.getDate() - dashboardState.range + 1);
      const format = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return { start: format(start), end: format(end) };
    }
    function dashboardTrendChart(start, end) {
      const width = 1400;
      const height = 520;
      const left = 52;
      const right = 18;
      const top = 18;
      const bottom = 42;
      const chartWidth = width - left - right;
      const chartHeight = height - top - bottom;
      const series = [
        { name: '新办订单', color: '#3475d7', fill: '#3475d7' },
        { name: '续费订单', color: '#18bfc4', fill: '#18bfc4' }
      ];
      const values = series.map(item => dashboardSeries[item.name].slice(-dashboardState.range));
      const maxValue = Math.max(...values.flat(), 1);
      const step = Math.max(10, Math.ceil(maxValue / 5 / 10) * 10);
      const maxAxis = Math.ceil(maxValue / step) * step;
      const point = (value, index, count) => ({
        x: left + (count === 1 ? chartWidth / 2 : index * chartWidth / (count - 1)),
        y: top + chartHeight - (value / maxAxis) * chartHeight
      });
      const allPoints = values.map(items => items.map((value, index) => point(value, index, items.length)));
      const grid = Array.from({ length: 6 }, (_, index) => {
        const value = maxAxis - index * maxAxis / 5;
        const y = top + index * chartHeight / 5;
        return `<line class="dashboard-chart-grid" x1="${left}" y1="${y}" x2="${left + chartWidth}" y2="${y}"/><text class="dashboard-chart-axis" x="8" y="${y + 4}">${Math.round(value)}</text>`;
      }).join('');
      const labelDate = new Date(`${start}T00:00:00`);
      const labels = allPoints[0].map(item => {
        const label = `${labelDate.getMonth() + 1}/${labelDate.getDate()}`;
        labelDate.setDate(labelDate.getDate() + 1);
        return `<text class="dashboard-chart-axis" text-anchor="middle" x="${item.x}" y="${height - 10}">${label}</text>`;
      }).join('');
      const lines = allPoints.map((points, index) => {
        const item = series[index];
        const pointString = points.map(pointItem => `${pointItem.x.toFixed(1)},${pointItem.y.toFixed(1)}`).join(' ');
        const areaString = `${left},${top + chartHeight} ${pointString} ${left + chartWidth},${top + chartHeight}`;
        const dots = points.map(pointItem => `<circle class="dashboard-chart-point" style="stroke:${item.color}" cx="${pointItem.x}" cy="${pointItem.y}" r="3.5"/>`).join('');
        return `<polygon class="dashboard-chart-area" style="fill:${item.fill}" points="${areaString}"/><polyline class="dashboard-chart-line" style="stroke:${item.color}" points="${pointString}"/>${dots}`;
      }).join('');
      return `<svg class="dashboard-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${start} 至 ${end} 新办和续费趋势"><g>${grid}</g>${lines}<g>${labels}</g></svg>`;
    }
    function dashboardMetricSparkline(values, start, end, label, key) {
      const width = 320;
      const height = 68;
      const left = 4;
      const right = 4;
      const top = 6;
      const bottom = 8;
      const chartWidth = width - left - right;
      const chartHeight = height - top - bottom;
      const maxValue = Math.max(...values, 1);
      const minValue = Math.min(...values);
      const range = Math.max(maxValue - minValue, 1);
      const point = (value, index) => ({
        x: left + (values.length === 1 ? chartWidth / 2 : index * chartWidth / (values.length - 1)),
        y: top + chartHeight - ((value - minValue) / range) * chartHeight
      });
      const points = values.map(point);
      const smoothPath = points.map((item, index) => {
        if (index === 0) return `M ${item.x.toFixed(1)} ${item.y.toFixed(1)}`;
        const prev = points[index - 1];
        const controlX = ((prev.x + item.x) / 2).toFixed(1);
        return `C ${controlX} ${prev.y.toFixed(1)}, ${controlX} ${item.y.toFixed(1)}, ${item.x.toFixed(1)} ${item.y.toFixed(1)}`;
      }).join(' ');
      const areaPath = `${smoothPath} L ${(left + chartWidth).toFixed(1)} ${(top + chartHeight).toFixed(1)} L ${left.toFixed(1)} ${(top + chartHeight).toFixed(1)} Z`;
      const gradientId = `dashboard-metric-gradient-${key}`;
      return `<div class="dashboard-metric-sparkline"><svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${start} 至 ${end} ${label}趋势"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--dashboard-accent)" stop-opacity=".22"/><stop offset="100%" stop-color="var(--dashboard-accent)" stop-opacity="0"/></linearGradient></defs><path class="dashboard-metric-sparkline-fill" fill="url(#${gradientId})" d="${areaPath}"/><path class="dashboard-metric-sparkline-line" vector-effect="non-scaling-stroke" d="${smoothPath}"/></svg></div>`;
    }
    function dashboardChart() {
      const { start, end } = dashboardDateParts();
      return dashboardTrendChart(start, end);
    }
    function dashboardNoticeGroups() {
      const definitions = [
        { label: '退款申请待处理', types: ['退款待审批'], icon: 'refund', action: "openFinancePage('refunds')" },
        { label: '通行异常待处理', types: ['通行同步异常'], icon: 'alert', action: "switchPage('passages')" },
        { label: '发票申请待处理', types: ['发票待上传'], icon: 'receipt', action: "openFinancePage('invoices')" }
      ];
      return definitions.map(definition => ({
        ...definition,
        count: dashboardPendingItems.filter(item => definition.types.includes(item.type)).length
      })).filter(group => group.count > 0);
    }

    function dashboardPendingList() {
      const groups = dashboardNoticeGroups();
      const total = groups.reduce((sum, group) => sum + group.count, 0);
      const rows = groups.map(group => `<button type="button" class="dashboard-notice-item" onclick="${group.action}"><span class="dashboard-notice-icon">${iconSvg(group.icon)}</span><span class="dashboard-notice-label">${group.label}</span><span class="dashboard-notice-count">${group.count}</span><span class="dashboard-notice-arrow" aria-hidden="true">›</span></button>`).join('');
      return `<section class="dashboard-section dashboard-pending-panel"><div class="dashboard-notice-head"><h2 class="dashboard-trend-title">待处理通知</h2><span class="dashboard-notice-total">${total} 项待处理</span></div><div class="dashboard-notice-list">${rows || '<div class="dashboard-notice-empty">暂无待处理事项</div>'}</div></section>`;
    }

    function dashboardFinanceSummary() {
      const rows = financeDailyStats.map(row => financeRowForProject(row));
      return `<section class="dashboard-section dashboard-finance-panel"><div class="dashboard-finance-head"><h2 class="dashboard-trend-title">收支汇总表</h2></div><div class="dashboard-finance-table-wrap">${dashboardFinanceSummaryTableHtml(rows)}</div></section>`;
    }

    function dashboardFinanceSummaryTableHtml(rows) {
      const previousRow = date => {
        const previous = financeDailyStats.find(item => item.date === financeDateBefore(date));
        return previous ? financeRowForProject(previous) : null;
      };
      const tableRows = rows.map(row => {
        const previous = previousRow(row.date);
        return `<tr><td>${financeDateLabel(row.date)}</td><td>${row.paidOrders} 笔</td><td>${financeChangeHtml(row.paidOrders, previous?.paidOrders)}</td><td>${financeCurrency(row.paidAmount)}</td><td>${financeChangeHtml(row.paidAmount, previous?.paidAmount)}</td><td>${financeCurrency(row.actualRefundAmount)}</td><td>${financeChangeHtml(row.actualRefundAmount, previous?.actualRefundAmount)}</td><td>${financeCurrency(row.netAmount)}</td><td>${financeChangeHtml(row.netAmount, previous?.netAmount)}</td></tr>`;
      }).join('');
      return `<table><thead><tr><th>日期</th><th>支付成功笔数</th><th>较昨日</th><th>缴费金额</th><th>较昨日</th><th>退款金额</th><th>较昨日</th><th>净收款</th><th>较昨日</th></tr></thead><tbody>${tableRows || '<tr><td colspan="9"><div class="empty">暂无数据</div></td></tr>'}</tbody></table>`;
    }

    function dashboardPage() {
      const { end } = dashboardDateParts();
      const metrics = [
        ['本月缴费金额', '86.4', '万', '↑ 12% 较上月', 'pay', [58, 61, 59, 64, 67, 66, 71], 'pay'],
        ['本月订单数', '402', '笔', '↑ 11% 较上月', 'clipboard', [80, 64, 66, 73, 80, 88, 77], 'orders'],
        ['本月退款申请', '18', '笔', '↓ 4% 较上月', 'refund', [4, 6, 5, 7, 5, 8, 6], 'refund']
      ];
      return `<div class="dashboard-page"><div class="dashboard-page-head"><h1 class="dashboard-page-title">数据总览</h1><span class="dashboard-page-date">数据更新至 ${end}</span></div><section class="dashboard-section dashboard-overview-panel"><div class="dashboard-metric-grid">${metrics.map(([label, value, unit, change, icon, sparkline, key]) => `<div class="dashboard-metric"><div class="dashboard-metric-head"><div class="dashboard-metric-label">${label}</div><div class="dashboard-metric-icon">${iconSvg(icon)}</div></div><div class="dashboard-metric-main"><div class="dashboard-metric-value">${value}<span class="dashboard-metric-unit">${unit}</span></div><div class="dashboard-metric-change"><span class="dashboard-metric-change-arrow">${change.startsWith('↓') ? '↓' : '↑'}</span><span>${change.replace(/^[↑↓]\s*/, '')}</span></div></div>${dashboardMetricSparkline(sparkline, dashboardDateParts().start, end, label, key)}</div>`).join('')}</div></section><div class="dashboard-secondary-grid"><section class="dashboard-section dashboard-trend-panel"><div class="dashboard-trend-head"><h2 class="dashboard-trend-title">业务趋势</h2><div class="dashboard-trend-meta"><span>近 7 天</span><div class="dashboard-trend-legend"><span class="dashboard-trend-legend-item"><i class="dashboard-trend-legend-dot" style="background:#3475d7"></i>新办</span><span class="dashboard-trend-legend-item"><i class="dashboard-trend-legend-dot" style="background:#18bfc4"></i>续费</span></div></div></div><div class="dashboard-trend-chart">${dashboardChart()}</div></section>${dashboardPendingList()}</div>${dashboardFinanceSummary()}</div>`;
    }
