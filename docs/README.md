# Dashboard Realtime — โครงสร้างไฟล์ Google Apps Script

## วิธีใช้งาน

ใน Google Apps Script Editor ให้สร้างไฟล์ตามรายการด้านล่าง แล้ว copy เนื้อหาไปวาง

---

## ไฟล์ฝั่ง Server (.gs)

| ไฟล์ | จำนวนบรรทัด | หน้าที่ |
|------|-------------|---------|
| `Config.gs` | ~171 | ค่าคงที่ทั้งระบบ: CARRIERS, DATA_YEAR, SESSION_TTL, buildMonthSheets() |
| `Auth.gs` | ~232 | doGet, login, logout, getSession, token helpers, fail/lock |
| `DataReader.gs` | ~274 | getAllData(), logActivity(), getActivityLog() |
| `Settings.gs` | ~241 | Threshold, Monthly Target, User Management, heartbeat |
| `Tracking.gs` | ~777 | Tracking (กลุ่มเสี่ยง) + GrowthTracking (กลุ่มเติบโต) |

---

## ไฟล์ฝั่ง Client (.html)

| ไฟล์ | จำนวนบรรทัด | หน้าที่ |
|------|-------------|---------|
| `Index.html` | ~27 | Entry point — `<?!=include()?>` ทุกส่วน |
| `Styles.html` | ~2197 | CSS ทั้งหมด (design tokens, layout, components) |
| `Body.html` | ~1147 | HTML structure: nav, login overlay, dashboard panels |
| `Scripts.html` | ~11417 | JavaScript ทั้งหมด: charts, maps, API calls, UI logic |

---

## วิธี include HTML ใน GAS

```javascript
// ใน Code.gs หรือ Config.gs
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('Dashboard Realtime');
}
```

```html
<!-- Index.html -->
<?!= HtmlService.createHtmlOutputFromFile('Styles').getContent(); ?>
<?!= HtmlService.createHtmlOutputFromFile('Body').getContent(); ?>
<?!= HtmlService.createHtmlOutputFromFile('Scripts').getContent(); ?>
```

---

## จะแก้อะไร ไปที่ไหน

| สิ่งที่แก้ | ไปที่ไฟล์ |
|-----------|-----------|
| เพิ่ม Carrier ใหม่ | `Config.gs` → `CARRIERS` |
| เปลี่ยนปีข้อมูล | `Config.gs` → `DATA_YEAR` |
| เปลี่ยน session timeout | `Config.gs` → `SESSION_TTL_MS` |
| เพิ่มเดือนใหม่ | สร้าง Sheet `Raw-KPI-{Month}` ใน Spreadsheet ได้เลย |
| แก้ logic login | `Auth.gs` |
| แก้การดึงข้อมูล KPI | `DataReader.gs` → `getAllData()` |
| แก้ Threshold / Target | `Settings.gs` |
| แก้ Tracking sheet | `Tracking.gs` |
| แก้ CSS / สี | `Styles.html` |
| แก้ Layout / HTML | `Body.html` |
| แก้ Chart / Map / Logic | `Scripts.html` |
