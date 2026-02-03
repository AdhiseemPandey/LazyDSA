chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('reminderCheck', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'reminderCheck') {
    checkReminders();
  }
});

function checkReminders() {
  chrome.storage.local.get(['lastReminder'], (result) => {
    const lastReminder = result.lastReminder || 0;
    const now = Date.now();
    const eightHours = 8 * 60 * 60 * 1000;

    if (now - lastReminder > eightHours) {
      chrome.notifications.create({
        type: 'basic',
        title: 'Time to Practice!',
        message: 'Keep your coding streak going. Solve a question on lazyDSA!',
      });
      chrome.storage.local.set({ lastReminder: now });
    }
  });
}
