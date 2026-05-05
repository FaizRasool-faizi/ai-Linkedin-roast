const statusEl = document.getElementById("status");
const previewEl = document.getElementById("preview");
const extractBtn = document.getElementById("extractBtn");
const sendBtn = document.getElementById("sendBtn");
const targetJobEl = document.getElementById("targetJob");
const appUrlEl = document.getElementById("appUrl");

let extracted = null;

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get({
      appUrl: "http://localhost:3000",
      targetJob: "Software Engineer (AI & Full-Stack Development)",
    });
    if (appUrlEl) appUrlEl.value = settings.appUrl || "http://localhost:3000";
    if (targetJobEl) targetJobEl.value = settings.targetJob || targetJobEl.value;
  } catch {
    // ignore
  }
}

async function saveSettings() {
  try {
    await chrome.storage.sync.set({
      appUrl: (appUrlEl?.value || "").trim() || "http://localhost:3000",
      targetJob: (targetJobEl?.value || "").trim() || "Software Engineer (AI & Full-Stack Development)",
    });
  } catch {
    // ignore
  }
}

loadSettings();
appUrlEl?.addEventListener("change", saveSettings);
targetJobEl?.addEventListener("change", saveSettings);

function isLinkedInProfileUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("linkedin.com") && u.pathname.startsWith("/in/");
  } catch {
    return false;
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function ensureContentScript(tabId) {
  try {
    // ping - if listener exists, this succeeds
    await chrome.tabs.sendMessage(tabId, { type: "LR_EXTRACT_PROFILE" });
    return true;
  } catch {
    // not injected yet; inject and let caller retry
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["contentScript.js"],
    });
    return false;
  }
}

extractBtn.addEventListener("click", async () => {
  setStatus("Extracting...");
  sendBtn.disabled = true;
  previewEl.textContent = "";
  extracted = null;

  const tab = await getActiveTab();
  if (!tab?.id || !tab?.url || !isLinkedInProfileUrl(tab.url)) {
    setStatus("Open a LinkedIn profile page (linkedin.com/in/...) and try again.");
    return;
  }

  try {
    const hadListener = await ensureContentScript(tab.id);
    const resp = await chrome.tabs.sendMessage(tab.id, { type: "LR_EXTRACT_PROFILE" });
    if (!resp?.ok) throw new Error(resp?.error || "Extraction failed");
    extracted = resp.data;
    previewEl.textContent = extracted.text || "";
    sendBtn.disabled = !(extracted.text && extracted.text.trim().length > 0);
    setStatus(
      sendBtn.disabled
        ? "No text found on page."
        : hadListener
          ? "Ready to import."
          : "Script injected. Ready to import."
    );
  } catch (e) {
    setStatus(`Failed: ${String(e?.message || e)}`);
  }
});

sendBtn.addEventListener("click", async () => {
  if (!extracted?.text) return;
  const targetJob = (targetJobEl.value || "").trim();
  const baseUrl = (appUrlEl?.value || "").trim() || "http://localhost:3000";

  await saveSettings();

  setStatus("Opening app...");
  sendBtn.disabled = true;

  let appUrl;
  try {
    const u = new URL(baseUrl);
    u.searchParams.set("import", "1");
    appUrl = u.toString();
  } catch {
    setStatus("Invalid App URL. Example: https://stack-grow.vercel.app");
    sendBtn.disabled = false;
    return;
  }

  const waitForTabComplete = (tabId) =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        reject(new Error("Timed out waiting for app tab to load"));
      }, 15000);

      const onUpdated = (updatedTabId, info) => {
        if (updatedTabId !== tabId) return;
        if (info.status !== "complete") return;
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve(true);
      };

      chrome.tabs.onUpdated.addListener(onUpdated);

      // Handle race: tab might already be complete before listener catches it.
      chrome.tabs.get(tabId).then((t) => {
        if (t?.status === "complete") {
          clearTimeout(timeout);
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve(true);
        }
      });
    });

  try {
    // Important: keep popup open by opening the app tab in background.
    const tab = await chrome.tabs.create({ url: appUrl, active: false });
    const tabId = tab.id;
    if (!tabId) {
      setStatus("Could not open app tab.");
      return;
    }

    setStatus("Waiting for app...");
    await waitForTabComplete(tabId);

    setStatus("Importing...");
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (profileText, job) => {
        const importedAt = new Date().toISOString();
        localStorage.setItem("lr_import_profileData", profileText);
        localStorage.setItem("lr_import_targetJob", job || "");
        localStorage.setItem("lr_importedAt", importedAt);
        window.dispatchEvent(
          new CustomEvent("lr-import", {
            detail: { profileData: profileText, targetJob: job || "", importedAt },
          })
        );
      },
      args: [extracted.text, targetJob],
    });

    // Verify import arrived (read back length)
    const verify = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const t = localStorage.getItem("lr_import_profileData") || "";
        const j = localStorage.getItem("lr_import_targetJob") || "";
        return { length: t.length, hasJob: Boolean(j.trim()) };
      },
    });
    const result = verify?.[0]?.result;
    const len = Number(result?.length || 0);
    if (len > 0) {
      setStatus(`Imported (${len} chars). Now switch to the app tab and click Analyze Me.`);
    } else {
      setStatus(
        "Import failed (0 chars written). Make sure the app tab is http://localhost:3000 and try again."
      );
    }
  } catch (e) {
    setStatus(`Import failed: ${String(e?.message || e)}`);
  }
});

