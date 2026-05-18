# Phase 7.5 Notes

Branch: `codex/phase-7.5`

## Scope

รอบนี้เป็นงาน audit และ patch หน้า **ภาพรวม** กับ **ขนส่ง** ด้วยแนวทาง product UI จาก skill `impeccable` โดยเน้นให้ dashboard อ่านเร็วขึ้น ใช้งานซ้ำทุกวันได้มั่นคงขึ้น และไม่รื้อโครงสร้างใหญ่ของ Phase 7 ที่ทำไว้แล้ว

## Audit Summary

- หน้า `ภาพรวม` มีข้อมูลครบ แต่ผู้ใช้ยังต้องเริ่มอ่านจาก tab/kpi ทันทีโดยไม่มี context สั้น ๆ ว่ากำลังดูอะไร
- หน้า `ขนส่ง` ใช้สี carrier standard แล้ว แต่ยังไม่มี legend สีบนหน้า ทำให้ต้องจำเองว่าสีไหนคือขนส่งไหน
- ปุ่ม tab และ controls บางจุดมีขนาดค่อนข้างเล็กสำหรับ mobile/touch และ focus state ยังไม่ชัดพอ
- card หลักอ่านได้ดี แต่ hover/focus feedback ยังไม่สม่ำเสมอระหว่างหน้า `ภาพรวม` กับ `ขนส่ง`

## Changes

### Overview

- เพิ่ม `ops-page-head` ในหน้า `ภาพรวม` เพื่อบอก context ของหน้าว่าเป็นภาพรวมสถานการณ์ตามเดือนและ scope ปัจจุบัน
- เพิ่ม meta pills สั้น ๆ สำหรับ `Revenue`, `Volume`, `Avg/day` เพื่อช่วยให้ผู้ใช้เห็น metric หลักก่อนเข้า tab
- ปรับ CSS เฉพาะ `#mainOv` ให้ tab และ card มี focus/hover feedback ชัดขึ้น
- รวม KPI หลักและ KPI เสริม (`Avg Rev/ชิ้น`, `Avg Vol/วัน`) เข้า grid เดียวกัน เพื่อให้แสดงเป็นแถวเดียวเมื่อพื้นที่พอ และค่อย wrap บนหน้าจอเล็ก
- ปรับ chart grid ของแต่ละ tab ให้ใช้ `auto-fit` แทนคอลัมน์ตายตัว เพื่อแก้ช่องว่างด้านขวาเมื่อบาง role ซ่อน chart เช่น BD ไม่เห็น Zone chart
- แก้หน้า `BD Zone` สำหรับ AM: เดิม tab เปิดให้ AM เห็น แต่ chart render เฉพาะ Director ทำให้เกิดการ์ดเปล่า ตอนนี้ AM render chart ตาม scope ได้แล้ว
- เพิ่ม empty state ให้ horizontal bar chart เมื่อไม่มีข้อมูลใน scope ปัจจุบัน แทนการปล่อย canvas/card ว่าง
- เปลี่ยน mini chart ใต้ KPI หน้า `ภาพรวม` จากกราฟแท่ง+เส้นเป็น MoM summary strip แบบ `เดือนก่อน -> เดือนนี้` พร้อม diff และ % เพื่อให้อ่านการเติบโตได้เร็วขึ้น
- เพิ่มแถว `Avg Performance Trend` ใต้ KPI cards เป็นกราฟแท่ง+เส้น 3 ใบ ได้แก่ `Avg Rev/day trend`, `Avg Vol/day trend` และ `Avg Rev/ชิ้น trend`
- กราฟ trend ใช้ 6 เดือนล่าสุดจาก helper เดือนเดิม: แท่งคือค่าเฉลี่ยรายเดือน และเส้นคือ % MoM จากเดือนก่อนหน้า
- ปรับ visual ของ trend charts ให้เบาลงและอ่านง่ายขึ้น: แท่งใช้สีอ่อนพร้อมขอบ, เส้น MoM ใช้สีเข้ม, ซ่อน legend ซ้ำใน canvas และเพิ่ม summary ค่าล่าสุดใต้กราฟ

## UX Decision: Card หรือ Graph

- ใช้ **การ์ด** สำหรับตัวเลขที่ต้องตัดสินใจเร็ว เช่น Revenue, Volume, Avg Rev/day, Avg Rev/ชิ้น และ Avg Vol/วัน เพราะผู้ใช้ต้องเห็นสถานะล่าสุดภายในไม่กี่วินาที
- ใช้ **กราฟ** สำหรับแนวโน้มและการเปรียบเทียบ เช่น ราย Zone, ราย Package, รายจังหวัด, carrier share และ month comparison เพราะกราฟเหมาะกับการเห็น pattern มากกว่าการอ่านค่าหนึ่งค่า
- แนวทางที่เลือกในรอบนี้คือ **คงการ์ดด้านบนเป็น command KPI** และเปลี่ยน mini chart เป็น MoM summary strip ส่วนกราฟหลักยังอยู่ใน panel ด้านล่างของแต่ละ tab
- ไม่แนะนำให้เปลี่ยน KPI ด้านบนทั้งหมดเป็นกราฟ เพราะจะทำให้ first scan ช้าลง และทำให้หน้า `ภาพรวม` ดูแน่นเกินสำหรับงานปฏิบัติการ
- ถ้า role บางประเภทเห็น chart น้อยกว่า role อื่น ให้แก้ด้วย responsive grid ก่อน ไม่ควรเพิ่ม card ที่ไม่มี action หรือ insight จริงเพียงเพื่อเติมพื้นที่ว่าง
- ถ้าต้องการเห็น trend เชิงภาพ ให้ใช้แถว `Avg Performance Trend` แยกจาก KPI card เพื่อไม่ให้ KPI card อ่านยาก

### Carrier

- เพิ่มพื้นที่ `carrier_color_legend` ใต้ KPI ขนส่ง
- เพิ่ม `renderCarrierColorLegend(stats)` เพื่อสร้าง legend จาก carrier ที่มีข้อมูลจริงในเดือน/ตัวกรองปัจจุบัน
- legend ใช้สีจาก `getCarrierColor()` จึงสอดคล้องกับ `CG_COLORS` และ alias ที่ตั้งไว้ก่อนหน้า
- กรณีไม่มีข้อมูลหรือไม่มี carrier จะซ่อน legend อัตโนมัติ

### Responsive & Accessibility

- เพิ่ม `focus-visible` สำหรับ tab, select และ input ในหน้า `ภาพรวม`/`ขนส่ง`
- เพิ่ม minimum height ของ tab/control เป็น 36px บน desktop และ 44px บน mobile
- ทำ carrier legend ให้ scroll แนวนอนได้บนหน้าจอเล็ก เพื่อลดปัญหาล้นหรือเบียด chart

## Files Touched

- `src/Body.html`
- `src/Scripts.html`
- `src/Styles.html`
- `docs/PHASE_7_5_NOTES.md`

## Verification

- ต้องตรวจ syntax ของ script blocks ใน `src/Scripts.html`
- ต้องตรวจ `git diff --check`
- Manual QA ที่ยังควรทำ: เปิดหน้า `ภาพรวม`, เปิดหน้า `ขนส่ง`, เปลี่ยนเดือน carrier, ใช้ carrier filter และตรวจว่า legend เปลี่ยนตามข้อมูล/ตัวกรอง
