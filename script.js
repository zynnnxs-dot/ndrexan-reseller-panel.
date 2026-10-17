// NEXORA PREMIUM public storefront — Supabase shared backend.
const $ = id => document.getElementById(id);
const escapeHTML = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
let db = null;
let productsCache = [];
let settingsCache = { whatsapp_admin:"", hero_image_url:"" };
function backendReady(){return !!(window.NEXORA_CONFIG && window.NEXORA_CONFIG.supabaseUrl && window.NEXORA_CONFIG.supabaseAnonKey && !window.NEXORA_CONFIG.supabaseAnonKey.includes("TEMPEL_"))}
async function initBackend(){
 if(!backendReady()){renderCatalog();setContactLinks();return}
 try{
   db=window.supabase.createClient(window.NEXORA_CONFIG.supabaseUrl,window.NEXORA_CONFIG.supabaseAnonKey);
   const [{data:products,error:pErr},{data:settings,error:sErr}]=await Promise.all([
     db.from("products").select("*").eq("active",true).order("sort_order").order("created_at"),
     db.from("site_settings").select("*").eq("id",1).maybeSingle()
   ]);
   if(pErr)throw pErr;if(sErr)throw sErr;
   productsCache=products||[];settingsCache=settings||settingsCache;
   renderCatalog();setContactLinks();
 }catch(e){console.error(e);renderCatalog();setContactLinks();showBackendNote("Backend belum siap. Pastikan SQL sudah dijalankan dan config.js berisi anon/public key.");}
}
function showBackendNote(msg){const grid=$("product-grid");if(grid&&!grid.children.length)grid.innerHTML=`<div class="empty-state">${escapeHTML(msg)}</div>`}
function whatsappLink(message){const n=String(settingsCache.whatsapp_admin||"").replace(/\D/g,"");return n.length>=8?"https://wa.me/"+n+"?text="+encodeURIComponent(message):""}
function renderCatalog(){
 const grid=$("product-grid");if(!grid)return;
 const products=productsCache;
 $("product-count").textContent=String(products.length).padStart(2,"0")+" ITEMS";
 const total=products.reduce((sum,p)=>sum+Math.max(0,Number(p.stock)||0),0);
 $("stock-summary").textContent=total>0?"● STOCK AVAILABLE":"● CHECK STOCK";
 if(!products.length){grid.innerHTML='<div class="empty-state">Katalog belum tersedia. Admin dapat menambahkan produk dari panel admin.</div>';return}
 grid.innerHTML=products.map((p,i)=>{
 const stock=Math.max(0,Number(p.stock)||0),out=stock===0;
 const discount=Math.max(0,Number(p.discount)||0),old=Number(p.old_price)||0,price=Number(p.price)||0;
 const showDiscount=discount>0&&old>price;
 const visual=p.image_url?`<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" loading="lazy">`:`<span class="visual-icon ${escapeHTML(p.name.toLowerCase().includes("canva")?"canva":p.name.toLowerCase().includes("capcut")?"capcut":p.name.toLowerCase().includes("spotify")?"spotify":p.name.toLowerCase().includes("alight")?"alight":"")}">${escapeHTML(p.icon||"✦")}</span>`;
 const message=`Halo admin NEXORA PREMIUM, saya ingin memesan ${p.name}. Harga yang tertera ${money(price)}${showDiscount?" (diskon "+discount+"%)":""}. Mohon konfirmasi stok dan instruksi pembayaran QRIS.`;
 const href=whatsappLink(message);
 return `<article class="product-card"><div class="product-visual"><span class="product-number">N° ${String(i+1).padStart(2,"0")}</span>${showDiscount?`<span class="product-badge">-${discount}%</span>`:""}${visual}</div><div class="product-content"><div class="product-category">${escapeHTML(p.category||"DIGITAL / PREMIUM")}</div><h3>${escapeHTML(p.name)}</h3><p class="product-desc">${escapeHTML(p.description||"Produk digital premium pilihan.")}</p><div class="price-row"><div><div class="price-now">${money(price)}</div>${showDiscount?`<div class="price-old">${money(old)}</div>`:""}</div>${showDiscount?`<span class="discount">SAVE ${discount}%</span>`:""}</div><div class="stock-line"><span><i class="stock-dot ${out?"out":""}"></i>${out?"Stok habis":"Stok tersedia"}</span><span>${stock} UNIT</span></div><a class="order-btn ${out||!href?"disabled":""}" ${out||!href?'aria-disabled="true" href="#"':`href="${escapeHTML(href)}" target="_blank" rel="noopener"`}>${out?"Stok habis":!href?"Hubungi admin":"Order via WhatsApp"} <span>↗</span></a></div></article>`;
 }).join("");
}
function setContactLinks(){
 ["nav-order","ask-admin","bottom-order"].forEach(id=>{const el=$(id);if(!el)return;const href=whatsappLink("Halo admin NEXORA PREMIUM, saya ingin bertanya tentang produk.");el.href=href||"#produk";});
 if(settingsCache.hero_image_url&&$("hero-image"))$("hero-image").style.backgroundImage=`url("${settingsCache.hero_image_url.replace(/["\\]/g,"")}")`;
}
if($("year"))$("year").textContent=new Date().getFullYear();
initBackend();
