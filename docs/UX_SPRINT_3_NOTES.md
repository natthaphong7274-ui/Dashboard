# UX Sprint 3 Notes

Branch: `UX_Sprint-3`

## Scope

ทำให้ Home Map เป็น command view ที่พาผู้ใช้จากพื้นที่บนแผนที่ไปสู่งาน follow-up ได้ชัดขึ้น โดยไม่เปลี่ยนโครง Leaflet map เดิมมากเกินจำเป็น

## Changes

- ปรับเกณฑ์สี Risk/Watch/Stable/Growth ให้เป็น overlay อยู่บนตัวแผนที่โดยตรง เพื่อให้ BD, AM และ Director เห็นเกณฑ์เดียวกันใน context ของแผนที่
- นำกล่องเกณฑ์ออกจาก sidebar แล้วคืน sidebar ให้เป็นพื้นที่ action/focus list
- เพิ่มแผง `แนวโน้มพื้นที่ใน scope นี้` ใต้แผนที่ แสดงกราฟ Revenue รายเดือน, จำนวนพื้นที่ Risk/Watch/Growth และพื้นที่ที่โตเด่น/ควรติดตาม
- ปรับ logic สีแผนที่ให้เทียบ `% เปลี่ยนแปลง Avg Rev/day` รายพื้นที่/จังหวัดใน scope ปัจจุบัน ไม่ใช่เทียบยอด Revenue รวมดิบ

- เพิ่ม action card ด้านข้างของ Home Map สำหรับพื้นที่ที่เลือก
- ปรับ action card ให้เป็น popup ซ้อนบนแผนที่ แสดงเฉพาะเมื่อคลิกจังหวัดหรือรายการพื้นที่
- คลิกจังหวัดบนแผนที่แล้วเปิด popup action card แทนการเปิด drill modal ทันที
- เพิ่ม side list `พื้นที่ที่ควรเริ่มก่อน` โดยเรียงจากจำนวน action ที่ต้องทำและ revenue
- เพิ่ม fallback list สำหรับรายการที่ไม่มีจังหวัด จึงไม่สามารถวางลงแผนที่ได้
- action card แสดง Revenue, Volume, Active count, สถานะ Risk/Watch/Growth/Stable และรายการ follow-up สำคัญ
- เพิ่มปุ่มทางลัดจาก action card ไป `รายการลูกค้า`, `Risk follow-up` และ `Growth follow-up`
- เมื่อเปลี่ยน Zone filter จะ rebuild side list และ action card ตาม scope ปัจจุบัน
- ย้ายกล่องอธิบายเกณฑ์แผนที่จาก sidebar ไปไว้บนตัวแผนที่ เพื่อให้เห็นเกณฑ์พร้อมกับสีพื้นที่จริง

## Hero Chart & Forecast Logic Upgrade (New)

- **Hero Chart Unification:** ยุบการ์ด KPI (Avg Rev/day, Avg Vol/day, Forecast EOM) มารวมไว้เป็นส่วนหัวของกราฟเส้นขนาดใหญ่เพียงแผงเดียว (Hero Chart) ลด Cognitive Load และเพิ่มพื้นที่ให้แผนที่
- **Metric Normalization:** เปลี่ยนแกน Y ของกราฟเส้นให้พล็อตด้วยค่า **Avg/day** ทั้งหมด ทำให้สามารถเปรียบเทียบ Performance แบบ Apple-to-Apple ได้อย่างสมบูรณ์แบบ
- **Weighted Time Series Blending Model:** อัปเกรดลอจิกพยากรณ์ Forecast EOM
  - ใช้ **Historical WMA** คำนวณความเร็วเฉลี่ย 3 เดือนย้อนหลังแบบถ่วงน้ำหนัก (x3, x2, x1)
  - ผสานกับ **Current Run-rate** โดยให้น้ำหนักตามจำนวนวันที่ผ่านไปในเดือนปัจจุบัน (ยิ่งเข้าใกล้ปลายเดือน ยิ่งใช้น้ำหนักเดือนปัจจุบันสูง) ทำให้ตัวเลข Forecast แม่นยำและ Stable
- **UX Consolidation:** ลบกราฟแท่ง (Bar Chart) และการ์ดข้อมูล Insights (โตเด่นสุด / เสี่ยงสุด) ที่ซ้ำซ้อนกับแผง "พื้นที่ที่ควรเริ่มก่อน (Focus List)" ทิ้ง เพื่อทำให้หน้าจอ Clean และโฟกัสได้ดีขึ้น

## Files Touched

- `src/Scripts.html`
- `src/Styles.html`

## Verification

- ต้องรัน syntax check หลังจบงาน
- ต้องตรวจ `git diff --check` หลังจบงาน

## Manual Testing Still Needed

- ทดสอบ Home Map กับ role BD
- ทดสอบ Home Map กับ role AM
- ทดสอบ Home Map กับ role Director
- คลิกจังหวัดบนแผนที่แล้วดูว่า action card เปลี่ยนตามพื้นที่
- ตรวจว่า popup action card ไม่บังส่วนสำคัญของแผนที่บน desktop และ mobile
- ตรวจว่าปุ่มปิด popup ทำงาน
- เปลี่ยน Zone filter แล้วดูว่า side list และ action card sync ตาม filter
- อ่านกล่องเกณฑ์แผนที่แล้วเทียบกับสีพื้นที่จริง
- ทดสอบกรณีข้อมูลไม่มีจังหวัดเพื่อดู fallback list
- ตรวจ mobile layout ของ action card และ side list
