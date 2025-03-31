export function DateDisplay() {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    const formattedDate = today.toLocaleDateString("en-US", options)
  
    return <div className="font-serif italic">{formattedDate}</div>
  }
  
  