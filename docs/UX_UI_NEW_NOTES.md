# UX/UI New Branch Notes

Branch: `codex/UX_UI_New`

## เป้าหมายของ branch นี้

ยกเครื่องหน้าตา dashboard ให้เป็น operational dashboard ที่ดูมืออาชีพ เร็ว และเน้นงานมากขึ้น โดยใช้แนวทางจาก `impeccable` และบริบทที่กำหนดไว้ใน `PRODUCT.md`

## สิ่งที่ทำไป

- เพิ่ม `PRODUCT.md` เพื่อกำหนดทิศทางดีไซน์ของโปรเจกต์เป็น product UI สำหรับงานภายใน
- ปรับระบบดีไซน์รวมให้ทั้งแอปใช้โทนเดียวกันมากขึ้น เช่น nav, filter panel, month bar, card, modal, report center และ loading state
- ออกแบบหน้า login ใหม่ให้ดูเป็นเครื่องมือทำงานภายในมากขึ้น
- เปลี่ยนภาพฝั่งซ้ายของหน้า login จากกราฟแท่ง 3D เป็นฉากพัสดุ/คลังขนส่ง มี animation กล่องพัสดุตกลงมา สายพาน และ scanner line
- ปรับหน้าแรกของแต่ละบทบาทให้เริ่มจากแผนที่เป็นแกนหลัก
- เพิ่ม `map command view` สำหรับ Director, AM และ BD โดยย้ายข้อมูลสำคัญไปอยู่ใน panel ข้างแผนที่
- ลดการแสดง KPI และตารางยาวบนหน้าแรก เพื่อให้ผู้ใช้เริ่มจากพื้นที่และ action ที่เกี่ยวข้องกับบทบาทก่อน

## หน้าแรกตามบทบาท

### Director

- เห็นแผนที่ภาพรวมประเทศเป็นพื้นที่หลัก
- Panel ข้างแผนที่แสดง Revenue, Volume, Target pace และจำนวน zone ที่ต้อง escalate
- มี action ไปต่อ เช่น Report Center, Tracking, ตั้งเป้าประเทศ และ Growth list

### AM

- เห็นแผนที่ zone ที่ตัวเองดูแลเป็นพื้นที่หลัก
- Panel ข้างแผนที่แสดง Revenue, Active agents, Zone target และจำนวน BD ที่ต้องช่วย
- มี action ไปต่อ เช่น BD ranking, Risk list, Growth list และ Tracking summary

### BD

- เห็นแผนที่พอร์ตของตัวเองเป็นพื้นที่หลัก
- Panel ข้างแผนที่แสดง Revenue, Volume, Target pace และ Action queue
- มี action ไปต่อ เช่น Customer list, Risk follow-up, Growth follow-up และ Tracking status

## ไฟล์หลักที่เปลี่ยน

- `PRODUCT.md`
- `src/Body.html`
- `src/Scripts.html`
- `src/Styles.html`

## การตรวจสอบ

- ตรวจ `git diff --check` ผ่าน
- ตรวจ inline script syntax ผ่าน

## หมายเหตุ

ไฟล์ `.agents/` และ `skills-lock.json` เป็นไฟล์ local tooling จากการติดตั้ง skill `impeccable` ยังไม่ได้ commit เข้า branch นี้
