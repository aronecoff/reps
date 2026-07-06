-- Send an iMessage. Usage: osascript reply.applescript "<handle>" "<message>"
-- <handle> is the recipient's phone (+15551234567) or email, as registered with iMessage.
on run argv
	set theHandle to item 1 of argv
	set theMessage to item 2 of argv
	tell application "Messages"
		set theService to 1st account whose service type = iMessage
		set theBuddy to participant theHandle of theService
		send theMessage to theBuddy
	end tell
end run
