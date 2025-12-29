# Mux Webhook Setup & Debugging Analysis

## 🔴 CRITICAL ISSUE IDENTIFIED

**Root Cause**: The Mux webhook endpoint was **completely missing** from the codebase. This is why `mux_playback_id` and `mux_asset_id` remain NULL in the database.

## ✅ CODE IMPLEMENTATION STATUS

### Files Created/Verified:

1. **✅ `app/api/webhooks/mux/route.ts`** - CREATED
   - Handles POST requests from Mux
   - Verifies webhook signature using `MUX_WEBHOOK_SECRET`
   - Processes `video.asset.ready` events
   - Updates Supabase with asset_id and playback_id

2. **✅ `lib/webhook.ts`** - CREATED
   - Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
   - Updates videos table by matching `mux_upload_id`
   - Includes proper error handling and logging

3. **✅ `app/actions/mux.ts`** - VERIFIED
   - Correctly creates upload and stores `mux_upload_id`
   - Uses proper Mux SDK initialization

4. **✅ `app/dashboard/videos/page.tsx`** - VERIFIED
   - Correctly defined as `async` Server Component
   - Calls `getVideos()` to fetch data

5. **✅ `components/videos-data-table.tsx`** - VERIFIED
   - Correctly checks for `mux_playback_id`
   - Shows "Processing..." when playback_id is null
   - Displays thumbnail and player when available

---

## 🚨 EXTERNAL SETUP REQUIRED (HIGHEST PRIORITY)

### Step 1: Get Mux Webhook Secret

1. Log into [Mux Dashboard](https://dashboard.mux.com/)
2. Navigate to **Settings** → **Webhooks**
3. Create a new webhook or view existing webhook
4. Copy the **Signing Secret** (this is your `MUX_WEBHOOK_SECRET`)

### Step 2: Add Environment Variable

Add to your `.env.local` file:

```env
MUX_WEBHOOK_SECRET=your_webhook_signing_secret_here
```

**⚠️ CRITICAL**: Without this, webhook signature verification will fail and Mux will reject your endpoint.

### Step 3: Set Up Webhook URL in Mux Dashboard

#### For Local Development (using Ngrok):

1. **Install Ngrok** (if not already installed):
   ```bash
   # Windows (using Chocolatey)
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```

3. **Start Ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **In Mux Dashboard**:
   - Go to **Settings** → **Webhooks**
   - Click **Add Webhook** or edit existing
   - **Webhook URL**: `https://abc123.ngrok.io/api/webhooks/mux`
   - **Events**: Select `video.asset.ready` (or enable all video events)
   - **Save**

#### For Production:

1. **Deploy your Next.js app** (Vercel, Railway, etc.)
2. **Get your production URL** (e.g., `https://yourdomain.com`)
3. **In Mux Dashboard**:
   - **Webhook URL**: `https://yourdomain.com/api/webhooks/mux`
   - **Events**: Select `video.asset.ready`
   - **Save**

### Step 4: Test the Webhook

1. **Upload a test video** through your dashboard
2. **Check your Next.js server logs** for:
   ```
   [Mux Webhook] Received webhook: video.asset.ready
   [Mux Webhook] Successfully updated video
   ```
3. **Check Supabase** - The `mux_asset_id` and `mux_playback_id` should now be populated

---

## 🔍 DEBUGGING CHECKLIST

### If webhooks still don't work:

#### 1. Verify Environment Variables
```bash
# Check if MUX_WEBHOOK_SECRET is set
echo $MUX_WEBHOOK_SECRET  # Linux/Mac
echo %MUX_WEBHOOK_SECRET% # Windows CMD
$env:MUX_WEBHOOK_SECRET   # Windows PowerShell
```

#### 2. Check Mux Dashboard Webhook Logs
- Go to **Settings** → **Webhooks** → Click on your webhook
- View **Recent Deliveries** tab
- Check for failed deliveries and error messages

#### 3. Check Next.js Server Logs
- Look for `[Mux Webhook]` log entries
- Check for signature verification errors
- Check for database update errors

#### 4. Verify Ngrok is Running (Local Dev)
```bash
# Check if ngrok is running
curl http://localhost:4040/api/tunnels
```

#### 5. Test Webhook Endpoint Manually
```bash
# Test if endpoint is accessible
curl -X POST https://your-ngrok-url.ngrok.io/api/webhooks/mux \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### 6. Verify Database Connection
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify the `videos` table exists and has the correct columns
- Check RLS policies (should be bypassed with service role key)

---

## 📋 WEBHOOK FLOW DIAGRAM

```
1. User uploads video → getMuxUploadUrl() creates upload
   ↓
2. mux_upload_id saved to Supabase
   ↓
3. Video uploaded to Mux via UpChunk
   ↓
4. Mux processes video (takes 1-5 minutes)
   ↓
5. Mux sends webhook to /api/webhooks/mux
   ↓
6. Webhook verifies signature with MUX_WEBHOOK_SECRET
   ↓
7. updateVideoWithMuxIds() updates Supabase
   ↓
8. mux_asset_id and mux_playback_id saved
   ↓
9. Dashboard refreshes and shows video thumbnail/player
```

---

## 🎯 PRIORITY FIX ORDER

1. **🔴 CRITICAL**: Add `MUX_WEBHOOK_SECRET` to `.env.local`
2. **🔴 CRITICAL**: Configure webhook URL in Mux Dashboard
3. **🟡 IMPORTANT**: Set up Ngrok for local development
4. **🟡 IMPORTANT**: Test with a new video upload
5. **🟢 VERIFY**: Check webhook delivery logs in Mux Dashboard
6. **🟢 VERIFY**: Check Next.js server logs for webhook processing

---

## 📝 NOTES

- **Webhook Secret**: Must match exactly what's in Mux Dashboard
- **Signature Verification**: Uses HMAC-SHA256 (implemented in route.ts)
- **Database Update**: Uses `mux_upload_id` to find the correct video record
- **Playback ID**: Uses first public playback ID, or first available if no public
- **Error Handling**: All errors are logged to console for debugging

---

## ✅ VERIFICATION

After completing the setup:

1. Upload a new video
2. Wait 1-5 minutes for Mux processing
3. Check Supabase `videos` table - `mux_asset_id` and `mux_playback_id` should be populated
4. Refresh dashboard - video should show thumbnail and "View Video" button

If still not working, check the debugging checklist above.

