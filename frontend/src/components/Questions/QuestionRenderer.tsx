import { Exercise, QuestionType } from '../../types';
import FillBlankQuestion from './FillBlankQuestion';
import CodeOrderQuestion from './CodeOrderQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import MatchingQuestion from './MatchingQuestion';
import BugFixQuestion from './BugFixQuestion';
import CodingQuestion from './CodingQuestion';

interface QuestionRendererProps {
  exercise: Exercise;
  onSubmit: (answer: any) => void;
  disabled?: boolean;
}

export default function QuestionRenderer({ exercise, onSubmit, disabled }: QuestionRendererProps) {
  const questionType = exercise.type || 'CODING';

  const renderQuestion = () => {
    switch (questionType) {
      case 'FILL_BLANK':
        return (
          <FillBlankQuestion
            exercise={exercise}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        );
      case 'CODE_ORDER':
        return (
          <CodeOrderQuestion
            exercise={exercise}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        );
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceQuestion
            exercise={exercise}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        );
      case 'MATCHING':
        return (
          <MatchingQuestion
            exercise={exercise}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        );
      case 'BUG_FIX':
        return (
          <BugFixQuestion
            exercise={exercise}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        );
      case 'CODING':
      default:
        return (
          <CodingQuestion
            exercise={exercise}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="bg-[#252536] rounded-2xl p-6">
      {/* 题目标题 */}
      <h3 className="text-xl font-bold text-white mb-2">{exercise.title}</h3>
      <p className="text-white/70 mb-6">{exercise.description}</p>

      {/* 题目内容 */}
      {renderQuestion()}
    </div>
  );
}
