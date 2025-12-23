'use client'

import { useState, useRef } from 'react'
import { getMuxUploadUrl } from '@/app/actions/mux'
import { UpChunk } from '@mux/upchunk'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Upload } from 'lucide-react'

export function VideoUploadForm() {
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft')
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium'>('free')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setMessage({ type: 'error', text: 'Please select a valid video file.' })
        return
      }
      setSelectedFile(file)
      setMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a description.' })
      return
    }

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a video file to upload.' })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setMessage(null)

    try {
      // Step 1: Get Mux upload URL from server action
      const result = await getMuxUploadUrl({
        description: description.trim(),
        status,
        subscription_plan: subscriptionPlan,
      })

      if (!result.success || !result.uploadUrl) {
        throw new Error(result.error || 'Failed to get upload URL')
      }

      // Step 2: Upload file to Mux using UpChunk
      const upload = UpChunk.createUpload({
        endpoint: result.uploadUrl,
        file: selectedFile,
        chunkSize: 5120, // 5MB chunks
      })

      // Handle upload progress
      upload.on('progress', (progress: { detail: number }) => {
        const percent = Math.round(progress.detail)
        setUploadProgress(percent)
      })

      // Handle upload success
      upload.on('success', () => {
        setUploadProgress(100)
        setMessage({
          type: 'success',
          text: 'Upload complete! Mux is processing your video. This may take a few minutes.',
        })
        // Reset form
        setDescription('')
        setStatus('Draft')
        setSubscriptionPlan('free')
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setIsUploading(false)
      })

      // Handle upload error
      upload.on('error', (error: Error) => {
        console.error('Upload error:', error)
        setMessage({
          type: 'error',
          text: `Upload failed: ${error.message || 'An unknown error occurred'}`,
        })
        setIsUploading(false)
        setUploadProgress(0)
      })
    } catch (error) {
      console.error('Error during upload process:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Upload a video to Mux for processing and hosting. All metadata will be saved to Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description..."
              required
              disabled={isUploading}
              rows={4}
              className="w-full"
            />
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value: 'Draft' | 'Published') => setStatus(value)}
              disabled={isUploading}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Plan Field */}
          <div className="space-y-2">
            <Label htmlFor="subscription-plan">
              Subscription Plan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={subscriptionPlan}
              onValueChange={(value: 'free' | 'premium') => setSubscriptionPlan(value)}
              disabled={isUploading}
            >
              <SelectTrigger id="subscription-plan" className="w-full">
                <SelectValue placeholder="Select subscription plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="video-file">
              Video File <span className="text-destructive">*</span>
            </Label>
            <input
              ref={fileInputRef}
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || !selectedFile || !description.trim()}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

