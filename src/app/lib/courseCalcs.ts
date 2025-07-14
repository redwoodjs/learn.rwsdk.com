// Convert total minutes to ISO 8601 duration format
export function minutesToISO8601Duration(totalMinutes: number): string {
    if (totalMinutes === 0) return "PT0M";
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let duration = "PT";
    if (hours > 0) {
      duration += `${hours}H`;
    }
    if (minutes > 0) {
      duration += `${minutes}M`;
    }
    
    return duration;
  }