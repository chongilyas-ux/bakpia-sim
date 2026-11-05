import * as THREE from "three";

/* ============ dasar scene ============ */
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefe4c9);
scene.fog = new THREE.Fog(0xefe4c9, 30, 85);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);

const sun = new THREE.DirectionalLight(0xfff3d6, 2.4);
sun.position.set(18, 30, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -35;
sun.shadow.camera.right = sun.shadow.camera.top = 35;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0xb99a5e, 0.9));

function kotak(w, h, d, warna, x, y, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: warna, roughness: 0.9 })
  );
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  return m;
}

/* tanah + jalan */
const tanah = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0xc9b98a, roughness: 1 }));
tanah.rotation.x = -Math.PI / 2;
tanah.receiveShadow = true;
scene.add(tanah);
const jalan = new THREE.Mesh(new THREE.PlaneGeometry(160, 5), new THREE.MeshStandardMaterial({ color: 0x8a7f68, roughness: 1 }));
jalan.rotation.x = -Math.PI / 2;
jalan.position.y = 0.01;
jalan.receiveShadow = true;
scene.add(jalan);

/* pohon sederhana */
function pohon(x, z) {
  const batang = kotak(0.5, 2.4, 0.5, 0x6b4a2b, x, 1.2, z);
  const daun = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.4, 7), new THREE.MeshStandardMaterial({ color: 0x4e6b2f, roughness: 1 }));
  daun.position.set(x, 4.2, z);
  daun.castShadow = true;
  scene.add(daun);
  return batang;
}

/* gedung: rumah player di selatan (di belakang pemain), toko di utara */
kotak(8, 5, 7, 0xd9c49a, 0, 2.5, 16).name = "rumah";
const atapRumah = new THREE.Mesh(new THREE.ConeGeometry(6.4, 3, 4), new THREE.MeshStandardMaterial({ color: 0xa4552f, roughness: .85 }));
atapRumah.position.set(0, 6.5, 16);
atapRumah.rotation.y = Math.PI / 4;
atapRumah.castShadow = true;
scene.add(atapRumah);

/* toko: bangunan + bukaan pintu + konter + kasir + tenda */
const toko = kotak(10, 6, 7, 0x3f5427, 0, 3, -14);
const atapToko = kotak(10.6, 0.5, 7.6, 0x2f3b1e, 0, 6.3, -14);
atapToko.name = "atapToko";
kotak(6, 3.4, 0.3, 0x23301a, 0, 1.7, -10.4);          // bukaan pintu (gelap)
kotak(4.6, 1.0, 0.7, 0x8a6b45, 0, 1.0, -10.0);        // konter jualan
const kasir = orang(0.9, -11.4, 0x8a6b45);            // penjaga kasir
/* tenda bertoreh pelangi lembut di depan toko */
const tenda = kotak(8.4, 0.14, 1.8, 0xb3402c, 0, 4.3, -9.7);
tenda.rotation.x = 0.22;
/* papan nama toko */
const papan = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.5, 0.35), new THREE.MeshStandardMaterial({ color: 0xf9f4e3, roughness: .8 }));
papan.position.set(0, 4.6, -10.6);
scene.add(papan);
const kanvas = document.createElement("canvas");
kanvas.width = 512; kanvas.height = 104;
const su = kanvas.getContext("2d");
su.fillStyle = "#f9f4e3"; su.fillRect(0, 0, 512, 104);
su.fillStyle = "#3f5427"; su.font = "bold 46px 'Playfair Display', serif";
su.textAlign = "center"; su.textBaseline = "middle";
su.fillText("BAKPIA PATHOK 95", 256, 40);
su.fillStyle = "#c99c33"; su.font = "22px 'DM Sans', sans-serif";
su.fillText("SECANG · MAGELANG", 256, 82);
const papanTekstur = new THREE.CanvasTexture(kanvas);
papan.material = new THREE.MeshStandardMaterial({ map: papanTekstur, roughness: .8 });

for (const [x, z] of [[-16, 2], [-22, 10], [16, 2], [22, 10], [-16, -22], [18, -22]]) pohon(x, z);

/* jendela rumah supaya tidak datar */
for (const dx of [-2.6, 2.6]) {
  kotak(1.2, 1.2, 0.2, 0x8fb5c9, dx, 3.2, 12.35);
  kotak(1.5, 0.18, 0.3, 0x6b4a2b, dx, 2.5, 12.38);
}

/* ---- interaktif bercahaya ---- */
function titikMisi(warna) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 0.09, 40),
    new THREE.MeshBasicMaterial({ color: warna, transparent: true, opacity: 0.55 })
  );
  m.position.y = 0.06;
  scene.add(m);
  return m;
}
const cincinLaptop = titikMisi(0xc99c33);
const cincinToko = titikMisi(0x7a8f4e);
const cincinMotor = titikMisi(0xc99c33);

/* laptop di halaman depan rumah */
const laptop = kotak(1.15, 0.14, 0.85, 0x2b2a20, -3.4, 0.55, 12.2);
const layar = kotak(1.1, 0.75, 0.07, 0x4a5a6a, -3.4, 1.05, 12.6);
layar.rotation.x = -0.4;
const kilau = new THREE.PointLight(0x9ec7ff, 6, 5);
kilau.position.set(-3.4, 1.4, 12.7);
scene.add(kilau);

/* motor delivery parkir di depan toko */
const motor = new THREE.Group();
const bodi = kotak(0.6, 0.5, 1.5, 0xb3402c, 0, 0.55, 0);
const rodaD = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 18), new THREE.MeshStandardMaterial({ color: 0x1d1d1d }));
rodaD.rotation.z = Math.PI / 2; rodaD.position.set(0.32, 0.32, 0.55);
const rodaB = rodaD.clone(); rodaB.position.z = -0.55;
const kotakBakpia = kotak(0.55, 0.45, 0.55, 0xc99c33, -0.15, 1.0, -0.25);
motor.add(bodi, rodaD, rodaB, kotakBakpia);
motor.position.set(6.2, 0, -10.2);
motor.rotation.y = Math.PI / 2;
motor.traverse(o => { if (o.isMesh) o.castShadow = true; });
motor.visible = false;
scene.add(motor);

/* antrian 2 orang di toko: dua kapsul */
function orang(x, z, warnaBaju) {
  const g = new THREE.Group();
  const badan = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.8, 6, 14), new THREE.MeshStandardMaterial({ color: warnaBaju, roughness: .8 }));
  badan.position.y = 0.95; badan.castShadow = true;
  const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), new THREE.MeshStandardMaterial({ color: 0xe8b98a, roughness: .9 }));
  kepala.position.y = 1.72; kepala.castShadow = true;
  g.add(badan, kepala);
  g.position.set(x, 0, z);
  scene.add(g);
  return g;
}
const pengantreA = orang(-2.2, -9.0, 0x6d5aa8);
const pengantreB = orang(-3.6, -9.0, 0x3f7d8c);

/* ---- player ---- */
const player = new THREE.Group();
const badanP = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.8, 6, 14), new THREE.MeshStandardMaterial({ color: 0xb3402c, roughness: .8 }));
badanP.position.y = 0.95;
const kepalaP = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 14), new THREE.MeshStandardMaterial({ color: 0xe8b98a }));
kepalaP.position.y = 1.74;
badanP.castShadow = kepalaP.castShadow = true;
player.add(badanP, kepalaP);
player.position.set(0, 0, 12.5);
scene.add(player);

/* bakpia paket hasil belanja (tersembunyi sampai beli) */
const bawaan = kotak(0.32, 0.32, 0.32, 0xc99c33, 0, 0, 0);
bawaan.visible = false;
player.add(bawaan);
function koperTangan(kiri) {
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), new THREE.MeshStandardMaterial({ color: 0xe8b98a }));
  t.position.set(kiri ? 0.44 : -0.44, 0.8, 0);
  player.add(t);
}
koperTangan(true); koperTangan(false);

/* posisi misi */
const P_TOKO = new THREE.Vector3(0, 0, -10.2);
const P_LAPTOP = new THREE.Vector3(-3.4, 0, 12.2);
const P_MOTOR = new THREE.Vector3(6.2, 0, -9.2);
const P_RUMAH = new THREE.Vector3(0, 0, 12.5);

/* ============ state misi ============ */
const nyala = [];
const $ = id => document.getElementById(id);
const hud = $("hud"), hudJudul = $("hud-judul"), hudLangkah = $("hud-langkah"), hudWaktu = $("hud-waktu");
const dialog = $("dialog"), dialogTeks = $("dialog-teks"), dialogAksi = $("dialog-aksi");
const intro = $("intro"), panel = $("panel-hasil"), dpad = $("dpad");

let fase = "intro";      // intro | tunggu | jalan | beli | antre | pulang | online | tunggu-kirim | ambil | selesai
let mulaiJalan = 0, mulaiOnline = 0;
let waktuJalan = 0, waktuOnline = 0;
let target = null;       // kotak misi aktif
let motorBerjalan = false;

const MUATAN = { depan: 0, belakang: 0, kiri: 0, kanan: 0 };
const tombol = {};
addEventListener("keydown", e => { tombol[e.key.toLowerCase()] = true; });
addEventListener("keyup", e => { tombol[e.key.toLowerCase()] = false; });
for (const b of document.querySelectorAll("#dpad button")) {
  const arah = b.dataset.arah;
  b.addEventListener("pointerdown", e => { e.preventDefault(); MUATAN[arah] = 1; });
  for (const ev of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(ev, () => MUATAN[arah] = 0);
}

function teks(html) { dialogTeks.innerHTML = html; }
function tampilkan(html, aksi) {
  teks(html);
  dialogAksi.innerHTML = "";
  for (const [label, cls, fn] of aksi) {
    const el = label.startsWith("http") ? document.createElement("a") : document.createElement("button");
    if (label.startsWith("http")) { el.href = label; el.target = "_blank"; el.rel = "noreferrer"; el.textContent = cls; }
    else { el.textContent = cls; el.onclick = fn; }
    el.className = "btn-mini utama";
    dialogAksi.appendChild(el);
  }  dialog.classList.remove("hidden");
  dialog.classList.add("show");
}
function sembunyiDialog() { dialog.classList.remove("show"); dialog.classList.add("hidden"); }

function setMisi(judul, langkah) { hudJudul.textContent = judul; hudLangkah.textContent = langkah; }

/* mulai Misi 1: jalan ke toko */
$("btn-mulai").onclick = () => {
  intro.hidden = true;
  hud.hidden = false;
  dpad.hidden = false;
  fase = "jalan";
  mulaiJalan = performance.now();
  target = { pos: P_TOKO, radius: 3.2 };
  setMisi("Misi 1 · Jalan ke toko", "Langkah 1/3 · Ke toko");
  tampilkan(`<strong>Misi 1</strong>: Tokonya buka. Jalan ke toko <em>BAKPIA PATHOK 95</em>:<br><em>Cincin hijau di halaman depan toko adalah tujuanmu.</em>`, [["#1", "Mulai berjalan", () => {}]]);
};

/* Misi 2 akan dipanggil setelah Misi 1 */
function mulaiMisi2() {
  fase = "online";
  player.position.set(0, 0, 12.5);
  mulaiOnline = performance.now();
  target = { pos: P_LAPTOP, radius: 2.4 };
  setMisi("Misi 2 · Pesan online", "Langkah 1/3 · Buka website");
  tampilkan(`<strong>Misi 2</strong>: Sekarang tanpa keluar rumah. Berdiri di teras, buka <em>website Bakpia</em> dari laptopmu.<br><em>Cincin emas di samping laptop adalah langkahnya.</em>`, [["#2", "Tuju laptop", () => {}]]);
}

/* insiden dekati tujuan */
const jarak = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function periksaMisi() {
  if (fase === "tunggu-kirim" && motorBerjalan && jarak(player.position, motor.position) < 3.4) {
    waktuOnline = (performance.now() - mulaiOnline) / 1000;
    motorBerjalan = false;
    stageSelesai();
    return;
  }
  if (!target) return;
  const d = jarak(player.position, target.pos);
  if (fase === "jalan" && d < target.radius) {
    target = null;
    fase = "antre";
    setMisi("Misi 1 · Jalan ke toko", "Langkah 2/3 · Antre & beli");
    tampilkan(
      "Sampai di toko! Masih ada <strong>3 orang</strong> yang sedang antre di depanmu.",
      [["#antre", "Antre (menunggu giliran)", () => {
        teks("Kamu antre… <em>nomor giliran mendekat…</em>");
        dialogAksi.innerHTML = "";
        setTimeout(() => {
          fase = "pulang";
          bawaan.visible = true;
          target = { pos: P_RUMAH, radius: 3.2 };
          setMisi("Misi 1 · Jalan ke toko", "Langkah 3/3 · Pulang");
          tampilkan("<strong>Bakpia sudah kamu pegang!</strong> Tapi perjalananmu belum selesai — balik ke rumah dulu, masuk kembali ke <em>cincin di depan pintu</em>.<br><em>Semua ini untuk beberapa keping bakpia.</em>", [["#3", "Pulang", () => {}]]);
        }, 3200);
      }],
      ["#beli", "Loncat antre (tidak bisa)", () => {
        teks("Di dunia nyata tidak ada yang bisa loncat antre. <em>Kepala berputar memikirkan kamar sebelah.</em>");
        setTimeout(sembunyiDialog, 2400);
      }]]
    );
  } else if (fase === "pulang" && d < target.radius) {
    waktuJalan = (performance.now() - mulaiJalan) / 1000;
    target = null;
    hud.hidden = true;
    fase = "tunggu";
    tampilkan(`<strong>Misi 1 selesai!</strong> Waktu <strong>${waktuJalan.toFixed(1)} detik</strong>.<br>Sepuh, jalan, antre, pulang — semua kamu kerjakan sendiri.<br><em>Sekarang bandingkan dengan Misi 2…</em>`, []);
    setTimeout(() => {
      sembunyiDialog();
      mulaiMisi2();
      hud.hidden = false;
    }, 2200);
  } else if (fase === "online" && d < target.radius) {
    target = null;
    fase = "tunggu-kirim";
    setMisi("Misi 2 · Pesan online", "Langkah 2/3 · Pesan di website");
    tampilkan(
      "<strong>Website Bakpia Pathok 95</strong> terbuka di layar.<br>Pilih produk, isi data, konfirmasi — semua benar-benar <em>hanya 2 klik</em>. Sebagaimana web asli Bakpia Pathok 95.",
      [[ "https://bakpia-pathok-95.vercel.app", "Buka situs Bakpia asli ↗", () => {}],
       ["#pesan", "Pesan sekarang", () => {
        setMisi("Misi 2 · Pesan online", "Langkah 3/3 · Tunggu kiriman");
        teks("Pesanan dikirim! <em>Kurir di jalan menuju rumahmu…</em>");
        dialogAksi.innerHTML = "";
        mulaiOnline = performance.now();
        motor.visible = true;
        motorBerjalan = true;
        target = { pos: P_MOTOR, radius: 2.6 };
      }]]
    );
  } else if (motorBerjalan && jarak(player.position, motor.position) < 2.4) {
    waktuOnline = (performance.now() - mulaiOnline) / 1000;
    motorBerjalan = false;
    stageSelesai();
  }
}

function stageSelesai() {
  fase = "selesai";
  bawaan.visible = false;
  hud.hidden = true;
  sembunyiDialog();
  dpad.hidden = true;
  const selisih = Math.max(0, waktuJalan - waktuOnline);
  $("h-jalan").textContent = waktuJalan.toFixed(1) + " detik";
  $("h-online").textContent = waktuOnline.toFixed(1) + " detik";
  $("hasil-lucu").textContent =
    `Online hemat ${(selisih.toFixed(1))} detik, atau ${(waktuJalan / Math.max(waktuOnline, 0.1)).toFixed(1)}× lebih cepat — tanpa keluar rumah.`;
  panel.classList.remove("hidden");
}

/* ulang main */
$("btn-ulang").onclick = () => location.reload();

/* ============ gerak & kamera ============ */
const kecepatan = 7.5;
let heading = Math.PI;

function arahkanPlayer(dt) {
  if (fase === "intro" || fase === "selesai" || fase === "tunggu" || fase === "tunggu-kirim") return null;
  let x = 0, z = 0;
  if (tombol["w"] || tombol["arrowup"] || MUATAN.depan) z -= 1;
  if (tombol["s"] || tombol["arrowdown"] || MUATAN.belakang) z += 1;
  if (tombol["a"] || tombol["arrowleft"] || MUATAN.kiri) x -= 1;
  if (tombol["d"] || tombol["arrowright"] || MUATAN.kanan) x += 1;
  if (!x && !z) return null;
  const v = new THREE.Vector3(x, 0, z).normalize().multiplyScalar(kecepatan * dt);
  return v;
}

const jam = new THREE.Clock();
function animasi() {
  requestAnimationFrame(animasi);
  const dt = Math.min(jam.getDelta(), 0.05);
  const t = jam.elapsedTime;

  // gerak player
  const v = arahkanPlayer(dt);
  if (v) {
    player.position.add(v);
    const batas = 38;
    player.position.x = THREE.MathUtils.clamp(player.position.x, -batas, batas);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -11.4, batas + 16); // utara dibatasi depan toko (tidak boleh masuk gedung)
    // hadap arah jalan
    heading = Math.atan2(v.x, v.z);
  }
  player.rotation.y = heading;
  // bobbing jalan
  badanP.position.y = 0.95 + (v ? Math.abs(Math.sin(t * 12)) * 0.06 : 0);
  kepalaP.position.y = 1.74 + (v ? Math.abs(Math.sin(t * 12)) * 0.06 : 0);

  // kamera tetap: selalu dari selatan melihat utara (searah tombol W)
  let camTarget = new THREE.Vector3(player.position.x, 7.4, player.position.z + 9.5);
  // di area toko (utara jalan), lihat dari samping timur supaya tenda toko tidak menutupi player
  if (player.position.z < -7) camTarget.set(player.position.x + 10, 7, player.position.z + 3.2);
  camera.position.lerp(camTarget, 1 - Math.pow(0.001, dt));
  camera.lookAt(player.position.x, 1.2, player.position.z);

  // motor delivery melaju ke arah rumah
  if (motorBerjalan) {
    motor.position.lerp(new THREE.Vector3(player.position.x + 2.4, 0, player.position.z + 1.2), 0.015);
    motor.rotation.y = Math.atan2(player.position.x - motor.position.x, player.position.z - motor.position.z);
    rodaD.rotation.x += dt * 18; rodaB.rotation.x += dt * 18;
    motor.position.y = Math.abs(Math.sin(t * 14)) * 0.03;
  }

  // cincin misi & kilau
  cincinLaptop.visible = fase === "online";
  cincinToko.visible = fase === "jalan";
  cincinMotor.visible = fase === "tunggu-kirim" && motorBerjalan;
  const berdenyut = 0.45 + Math.sin(t * 5) * 0.15;

  for (const c of [cincinLaptop, cincinToko, cincinMotor]) c.material.opacity = berdenyut;
  kilau.intensity = 4 + Math.sin(t * 3) * 1.4;

  // orang antre & pengantre lain saling maju-mundur ringan (diam tsb kehilangan giliran)
  pengantreA.position.z = -9.0 + Math.sin(t * 1.7) * 0.03;
  pengantreB.position.z = -9.0 + Math.sin(t * 1.3 + 2) * 0.03;
  pengantreA.rotation.y = Math.sin(t * 0.8) * 0.12;

  // lantai misi ikut posisi target
  cincinLaptop.position.set(P_LAPTOP.x, 0.06, P_LAPTOP.z);
  cincinToko.position.set(P_TOKO.x, 0.06, P_TOKO.z);
  cincinMotor.position.copy(motor.position); cincinMotor.position.y = 0.06;

  // timer HUD
  if (fase === "jalan" || fase === "antre" || fase === "pulang") hudWaktu.textContent = ((performance.now() - mulaiJalan) / 1000).toFixed(1) + " detik";
  else if (fase === "online" || fase === "tunggu-kirim") hudWaktu.textContent = ((performance.now() - mulaiOnline) / 1000).toFixed(1) + " detik";
  else hudWaktu.textContent = "";

  periksaMisi();
  renderer.render(scene, camera);
}

function ukur() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener("resize", ukur);
ukur();

$("loader").hidden = true;
intro.hidden = false;
animasi();
// hook debug untuk pengujian otomatis
window.__sim = () => ({
  fase,
  pos: { x: +player.position.x.toFixed(2), z: +player.position.z.toFixed(2) },
  target: target ? { x: target.pos.x, z: target.pos.z, radius: target.radius } : null
});
