import { getCookie, setCookie } from "./browser";
import { hash } from "./str";

function getAnnouncementHash() {
  const announcement = document.querySelector(".announcement");
  const content = announcement ? announcement.textContent || "" : "";
  const hashedContent = hash(content.trim().replace(/\n\t/, ""));

  return hashedContent;
}

function hideAnnouncement() {
  const announcement = document.querySelector(".announcement");

  if (announcement) {
    const content = getAnnouncementHash();
    setCookie("dismissed_announcement", content);
    announcement.classList.add("d-none");
  }
}

function showAnnouncement() {
  const announcement = document.querySelector(".announcement");

  if (announcement) {
    announcement.classList.remove("d-none");
  }
}

export function checkAnnounementStatus() {
  const dismissedAnnouncement = getCookie("dismissed_announcement");
  const content = getAnnouncementHash();
  let isDismissed = false;

  if (dismissedAnnouncement === content) {
    isDismissed = true;
  }

  if (!isDismissed) {
    showAnnouncement();
  }

  if (isDismissed) {
    hideAnnouncement();
  }
}

export function initAnnouncementButton() {
  const button = document.querySelector(".announcement .close");

  if (button) {
    button.addEventListener("click", hideAnnouncement);
  }
}

export function initAnnouncement() {
  const dismissedAnnouncement = getCookie("dismissed_announcement");
  const content = getAnnouncementHash();
  let isDismissed = false;

  if (dismissedAnnouncement === content) {
    isDismissed = true;
  }

  if (!isDismissed) {
    showAnnouncement();
  }
}
