# Security Specification & Test-Driven Security Design

## 1. Data Invariants

1. **Identity & Authorship**:
   - Every `Post` must have an `authorId` equal to the caller's `request.auth.uid`.
   - Every `Comment` in `posts/{postId}/comments/{commentId}` must have an `authorId` equal to the caller's `request.auth.uid`.
   - Every `Heart` in `posts/{postId}/hearts/{userId}` must have the path variable `{userId}` strictly matching `request.auth.uid`.
   - Callers cannot forge authorship or spoof other users' identity.

2. **Integrity & Field Protection**:
   - `authorId` and `createdAt` are immortal/immutable fields upon creation.
   - Posts can only be created with required fields (`title`, `content`, `author`, `category`, `createdAt`, `authorId`).
   - Counter updates on posts (such as `hearts`) can only increment or decrement by 1 when toggling reactions, or remain unaffected by standard edits.
   - Ghost fields or unvetted privilege escalation properties are strictly forbidden.

3. **Multi-Tenant / Public Read Accessibility**:
   - Posts and comments that are approved are publicly readable so that any visitor can view the supportive blog feed and discussions in real time.
   - Heart reaction states can be read to display the live heart count.

4. **Resource Constraints**:
   - String boundaries: titles <= 200 chars, post content <= 5000 chars, comments <= 2000 chars, author names <= 50 chars.
   - IDs must be alphanumeric and safe from path-poisoning.

---

## 2. The Dirty Dozen Payloads (Designed to Break Identity, Integrity, and State)

1. **Payload 1 (Identity Spoofing - Fake Author UID on Post)**:
   Attempt to create a post where `authorId` is `"victim-uid-999"` while authenticated as `"attacker-uid-111"`.
   *Expected: PERMISSION_DENIED*

2. **Payload 2 (Unauthenticated Post Creation)**:
   Attempt to create a post with `request.auth == null`.
   *Expected: PERMISSION_DENIED*

3. **Payload 3 (Oversized Title - Denial of Wallet Attack)**:
   Attempt to create a post with a `title` containing 5,000 characters (exceeding 200 char limit).
   *Expected: PERMISSION_DENIED*

4. **Payload 4 (Oversized Content Attack)**:
   Attempt to create a post with `content` containing 50,000 characters.
   *Expected: PERMISSION_DENIED*

5. **Payload 5 (Shadow Field Injection on Post)**:
   Attempt to inject a ghost field `isAdmin: true` or `shadowPrivilege: "unlocked"` into a Post creation document.
   *Expected: PERMISSION_DENIED*

6. **Payload 6 (Identity Spoofing on Comment)**:
   Attempt to post a comment in `posts/{postId}/comments/{commentId}` with `authorId` set to another user's UID.
   *Expected: PERMISSION_DENIED*

7. **Payload 7 (Unauthenticated Comment Posting)**:
   Attempt to write a comment with no auth credentials (`request.auth == null`).
   *Expected: PERMISSION_DENIED*

8. **Payload 8 (Oversized Comment Spam)**:
   Attempt to post a comment with `content` exceeding 2,000 characters.
   *Expected: PERMISSION_DENIED*

9. **Payload 9 (Heart Forgery - Stolen User ID in Path)**:
   Attempt to create a heart in `posts/{postId}/hearts/victim-user-123` while logged in as `attacker-user-456`.
   *Expected: PERMISSION_DENIED*

10. **Payload 10 (Heart Spoofing - Fake Field)**:
    Attempt to write a heart document with extra data fields or invalid `userId` payload mismatch.
    *Expected: PERMISSION_DENIED*

11. **Payload 11 (Immutability Tampering - Changing authorId on Update)**:
    Attempt to update an existing post and alter `authorId` to transfer ownership.
    *Expected: PERMISSION_DENIED*

12. **Payload 12 (Direct Arbitrary Root Writes)**:
    Attempt to write directly to an unmapped collection (e.g. `/system_configs/master` or `/admins/{id}`).
    *Expected: PERMISSION_DENIED*
