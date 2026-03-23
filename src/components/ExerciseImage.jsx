import { getExerciseImageUrl } from '../services/exerciseApi'

export default function ExerciseImage({ images = [], name = '', size = 'card' }) {
  const src = getExerciseImageUrl(images, 0)

  const className = size === 'thumb' ? 'ex-thumb' : 'ex-card-img'

  if (!src) {
    return (
      <div className={size === 'thumb' ? 'ex-thumb ex-thumb-placeholder' : 'ex-card-img ex-card-placeholder'}>
        <span>💪</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      loading="lazy"
    />
  )
}
