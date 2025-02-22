import { DynamicBackgroundProps } from "../../utils/interfaces/interfaces"

const DynamicBackground = ({ 
  filepath, 
  type = 'video',
  height = 'h-full',
  width = 'w-full',
  imageData = null,
  className = '' 
}: DynamicBackgroundProps) => {
  const baseClasses = `relative object-cover ${height} ${width} ${className}`

    if (type === 'image') {
      const imageSrc = imageData || filepath

      return (
        <img
          src={imageSrc}
          alt="Background"
          className={baseClasses}
        />
      )
    }
  
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        className={baseClasses}
      >
        <source src={filepath} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )
  }
  
  export default DynamicBackground