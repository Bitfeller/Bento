pfps/X.pfp
    where X = uid
decks/primary/X.pic
    where X = deck id
drafts/X-Y.pic
    where X = user id, Y = timestamp (since 1970)

db - the file-system database structure used by Bento to store images and pfps.
Used for local environments.
- On the production/test server, the config relies on the actual file-server database.