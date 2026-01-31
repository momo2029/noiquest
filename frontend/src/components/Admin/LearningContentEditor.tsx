import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  Save,
  Plus,
  Trash2,
  Clock,
  FileText,
  Code,
  Lightbulb,
  AlertTriangle,
  Video,
  Link,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface CodeExample {
  title: string;
  code: string;
  language: string;
  explanation?: string;
}

interface Reference {
  title: string;
  url: string;
}

interface LearningContentEditorProps {
  unitId: string;
  unitTitle: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function LearningContentEditor({
  unitId,
  unitTitle,
  onClose,
  onSaved,
}: LearningContentEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'examples' | 'tips' | 'mistakes' | 'meta'>('content');

  // 表单数据
  const [content, setContent] = useState('');
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [commonMistakes, setCommonMistakes] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // 展开状态
  const [expandedExamples, setExpandedExamples] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    loadContent();
  }, [unitId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await api.getSkillUnitLearningContent(unitId);
      setContent(data.content || '');
      setCodeExamples(data.codeExamples || []);
      setTips(data.tips || []);
      setCommonMistakes(data.commonMistakes || []);
      setVideoUrl(data.videoUrl || '');
      setReferences(data.references || []);
      setEstimatedTime(data.estimatedTime);
    } catch (error) {
      console.error('加载学习资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateSkillUnitLearningContent(unitId, {
        content: content || undefined,
        codeExamples: codeExamples.length > 0 ? codeExamples : undefined,
        tips: tips.filter(t => t.trim()),
        commonMistakes: commonMistakes.filter(m => m.trim()),
        videoUrl: videoUrl || undefined,
        references: references.filter(r => r.title && r.url),
        estimatedTime: estimatedTime || undefined,
      });
      onSaved();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 代码示例操作
  const addCodeExample = () => {
    const newIndex = codeExamples.length;
    setCodeExamples([...codeExamples, { title: '', code: '', language: 'cpp', explanation: '' }]);
    setExpandedExamples(new Set([...expandedExamples, newIndex]));
  };

  const updateCodeExample = (index: number, field: keyof CodeExample, value: string) => {
    const updated = [...codeExamples];
    updated[index] = { ...updated[index], [field]: value };
    setCodeExamples(updated);
  };

  const removeCodeExample = (index: number) => {
    setCodeExamples(codeExamples.filter((_, i) => i !== index));
  };

  const toggleExampleExpand = (index: number) => {
    const newExpanded = new Set(expandedExamples);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedExamples(newExpanded);
  };

  // 要点操作
  const addTip = () => setTips([...tips, '']);
  const updateTip = (index: number, value: string) => {
    const updated = [...tips];
    updated[index] = value;
    setTips(updated);
  };
  const removeTip = (index: number) => setTips(tips.filter((_, i) => i !== index));

  // 常见错误操作
  const addMistake = () => setCommonMistakes([...commonMistakes, '']);
  const updateMistake = (index: number, value: string) => {
    const updated = [...commonMistakes];
    updated[index] = value;
    setCommonMistakes(updated);
  };
  const removeMistake = (index: number) => setCommonMistakes(commonMistakes.filter((_, i) => i !== index));

  // 参考资料操作
  const addReference = () => setReferences([...references, { title: '', url: '' }]);
  const updateReference = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };
  const removeReference = (index: number) => setReferences(references.filter((_, i) => i !== index));

  const tabs = [
    { id: 'content', label: '学习内容', icon: FileText },
    { id: 'examples', label: '代码示例', icon: Code, count: codeExamples.length },
    { id: 'tips', label: '学习要点', icon: Lightbulb, count: tips.filter(t => t.trim()).length },
    { id: 'mistakes', label: '常见错误', icon: AlertTriangle, count: commonMistakes.filter(m => m.trim()).length },
    { id: 'meta', label: '其他信息', icon: Link },
  ] as const;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#252536] rounded-2xl p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/70 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">编辑学习资料</h2>
            <p className="text-white/50 text-sm">{unitTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              保存
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex gap-1 p-2 border-b border-white/10 bg-[#252536]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {'count' in tab && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 学习内容 */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Markdown 格式的学习内容
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="## 标题&#10;&#10;这里写学习内容...&#10;&#10;### 子标题&#10;&#10;- 列表项1&#10;- 列表项2&#10;&#10;```cpp&#10;// 代码示例&#10;int main() {&#10;    return 0;&#10;}&#10;```"
                  className="w-full h-[500px] px-4 py-3 bg-[#252536] text-white rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-white/40 text-xs">
                支持 Markdown 语法，包括标题、列表、代码块、表格等
              </p>
            </div>
          )}

          {/* 代码示例 */}
          {activeTab === 'examples' && (
            <div className="space-y-4">
              <button
                onClick={addCodeExample}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
              >
                <Plus size={18} /> 添加代码示例
              </button>

              {codeExamples.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Code size={48} className="mx-auto mb-4 opacity-50" />
                  <p>暂无代码示例</p>
                  <p className="text-sm">点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {codeExamples.map((example, index) => (
                    <div key={index} className="bg-[#252536] rounded-xl overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                        onClick={() => toggleExampleExpand(index)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedExamples.has(index) ? (
                            <ChevronDown size={18} className="text-white/50" />
                          ) : (
                            <ChevronRight size={18} className="text-white/50" />
                          )}
                          <span className="text-white font-medium">
                            {example.title || `示例 ${index + 1}`}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            {example.language}
                          </span>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            removeCodeExample(index);
                          }}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {expandedExamples.has(index) && (
                        <div className="p-4 pt-0 space-y-3 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/50 text-xs mb-1">标题</label>
                              <input
                                type="text"
                                value={example.title}
                                onChange={e => updateCodeExample(index, 'title', e.target.value)}
                                placeholder="例如：变量声明示例"
                                className="w-full px-3 py-2 bg-white/5 text-white rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-white/50 text-xs mb-1">语言</label>
                              <select
                                value={example.language}
                                onChange={e => updateCodeExample(index, 'language', e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 text-white rounded-lg text-sm"
                              >
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-white/50 text-xs mb-1">代码</label>
                            <textarea
                              value={example.code}
                              onChange={e => updateCodeExample(index, 'code', e.target.value)}
                              placeholder="在这里输入代码..."
                              className="w-full h-48 px-3 py-2 bg-white/5 text-white rounded-lg font-mono text-sm resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white/50 text-xs mb-1">说明（可选）</label>
                            <textarea
                              value={example.explanation || ''}
                              onChange={e => updateCodeExample(index, 'explanation', e.target.value)}
                              placeholder="对代码的解释说明..."
                              className="w-full h-20 px-3 py-2 bg-white/5 text-white rounded-lg text-sm resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 学习要点 */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <button
                onClick={addTip}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
              >
                <Plus size={18} /> 添加要点
              </button>

              {tips.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
                  <p>暂无学习要点</p>
                  <p className="text-sm">点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-2">💡</span>
                      <input
                        type="text"
                        value={tip}
                        onChange={e => updateTip(index, e.target.value)}
                        placeholder="输入学习要点..."
                        className="flex-1 px-3 py-2 bg-[#252536] text-white rounded-lg text-sm"
                      />
                      <button
                        onClick={() => removeTip(index)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 常见错误 */}
          {activeTab === 'mistakes' && (
            <div className="space-y-4">
              <button
                onClick={addMistake}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
              >
                <Plus size={18} /> 添加常见错误
              </button>

              {commonMistakes.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>暂无常见错误</p>
                  <p className="text-sm">点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {commonMistakes.map((mistake, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-red-400 mt-2">⚠️</span>
                      <input
                        type="text"
                        value={mistake}
                        onChange={e => updateMistake(index, e.target.value)}
                        placeholder="输入常见错误..."
                        className="flex-1 px-3 py-2 bg-[#252536] text-white rounded-lg text-sm"
                      />
                      <button
                        onClick={() => removeMistake(index)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 其他信息 */}
          {activeTab === 'meta' && (
            <div className="space-y-6">
              {/* 预计学习时间 */}
              <div>
                <label className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <Clock size={16} />
                  预计学习时间（分钟）
                </label>
                <input
                  type="number"
                  value={estimatedTime || ''}
                  onChange={e => setEstimatedTime(e.target.value ? Number(e.target.value) : null)}
                  placeholder="例如：15"
                  className="w-32 px-3 py-2 bg-[#252536] text-white rounded-lg"
                />
              </div>

              {/* 视频链接 */}
              <div>
                <label className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <Video size={16} />
                  视频教程链接
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#252536] text-white rounded-lg"
                />
              </div>

              {/* 参考资料 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white/70 text-sm">
                    <Link size={16} />
                    参考资料
                  </label>
                  <button
                    onClick={addReference}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                  >
                    <Plus size={14} /> 添加
                  </button>
                </div>

                {references.length === 0 ? (
                  <p className="text-white/40 text-sm">暂无参考资料</p>
                ) : (
                  <div className="space-y-2">
                    {references.map((ref, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ref.title}
                          onChange={e => updateReference(index, 'title', e.target.value)}
                          placeholder="标题"
                          className="flex-1 px-3 py-2 bg-[#252536] text-white rounded-lg text-sm"
                        />
                        <input
                          type="url"
                          value={ref.url}
                          onChange={e => updateReference(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 bg-[#252536] text-white rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeReference(index)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#252536]">
          <p className="text-white/40 text-sm">
            保存后会自动更新静态文件
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
