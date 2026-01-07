export default function Loader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-12 h-12">
        {/* Animated spinner */}
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        <div
          className="absolute inset-2 border-4 border-transparent border-b-primary/50 rounded-full animate-spin"
          style={{ animationDirection: "reverse" }}
        />
      </div>
      <span className="ml-4 text-sm font-medium text-muted-foreground">Generating audio...</span>
    </div>
  )
}
