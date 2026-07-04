// Native macOS wrapper for Reps - a real app (no Chrome): an NSWindow hosting a
// WKWebView (Apple's built-in WebKit) that loads the deployed PWA. Its own
// process, own Dock icon, own persistent storage (localStorage), works offline
// from the service-worker cache. The autoUpdate service worker refreshes to new
// builds on the next launch.
//   Cmd-R reloads; Shift-Cmd-R force-refreshes (clears caches) if one ever sticks.
//
// Build: desktop/build.sh  (compiles this into ~/Applications/Reps.app)
import Cocoa
import WebKit

let APP_URL = "https://aronecoff.github.io/reps/"

// Caches that go stale. localStorage is deliberately NOT included, so logged
// weights and checkmarks survive a force-refresh.
let STALE_TYPES: Set<String> = [
    WKWebsiteDataTypeServiceWorkerRegistrations,
    WKWebsiteDataTypeDiskCache,
    WKWebsiteDataTypeMemoryCache,
    WKWebsiteDataTypeFetchCache,
]

class AppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate {
    var window: NSWindow!
    var web: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Portrait, phone-ish proportions - it's a workout app.
        let frame = NSRect(x: 0, y: 0, width: 460, height: 900)
        window = NSWindow(
            contentRect: frame,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Reps"
        window.minSize = NSSize(width: 360, height: 560)
        window.center()
        window.setFrameAutosaveName("RepsMainWindow")
        window.backgroundColor = NSColor(red: 0.067, green: 0.075, blue: 0.09, alpha: 1) // #111317

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default() // persist localStorage

        web = WKWebView(frame: frame, configuration: config)
        web.autoresizingMask = [.width, .height]
        web.uiDelegate = self
        web.setValue(false, forKey: "drawsBackground") // no white flash before load

        window.contentView = web
        window.makeKeyAndOrderFront(nil)

        setupMenu()
        load()

        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }

    func load() {
        if let url = URL(string: APP_URL) { web.load(URLRequest(url: url)) }
    }

    func clearStaleCaches(_ done: @escaping () -> Void) {
        WKWebsiteDataStore.default().removeData(
            ofTypes: STALE_TYPES,
            modifiedSince: Date(timeIntervalSince1970: 0)
        ) { done() }
    }

    @objc func reloadPage() { web.reload() }
    @objc func forceRefresh() { clearStaleCaches { [weak self] in self?.load() } }

    func setupMenu() {
        let mainMenu = NSMenu()

        let appItem = NSMenuItem()
        mainMenu.addItem(appItem)
        let appMenu = NSMenu()
        appItem.submenu = appMenu
        appMenu.addItem(withTitle: "Quit Reps", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        let viewItem = NSMenuItem()
        mainMenu.addItem(viewItem)
        let viewMenu = NSMenu(title: "View")
        viewItem.submenu = viewMenu

        let reloadItem = NSMenuItem(title: "Reload", action: #selector(reloadPage), keyEquivalent: "r")
        reloadItem.target = self
        viewMenu.addItem(reloadItem)

        let hardItem = NSMenuItem(title: "Force Refresh (clear cache)", action: #selector(forceRefresh), keyEquivalent: "r")
        hardItem.keyEquivalentModifierMask = [.command, .shift]
        hardItem.target = self
        viewMenu.addItem(hardItem)

        NSApp.mainMenu = mainMenu
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
