import { BeakerIcon, BoltIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Real-time Translation',
    description: 'Get instant translations as you type with our advanced AI technology.',
    icon: BoltIcon,
  },
  {
    name: '100+ Languages',
    description: 'Support for over 100 languages with professional-grade accuracy.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Smart Detection',
    description: 'Automatic language detection for seamless translation experience.',
    icon: BeakerIcon,
  },
  {
    name: 'Context Awareness',
    description: 'Maintains context and nuances across different languages.',
    icon: SparklesIcon,
  },
];

export default function Features() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Powerful Features
        </h2>
        <p className="mt-4 text-gray-400">
          Experience the next generation of language translation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="h-12 w-12 rounded-lg bg-purple-900/30 flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">{feature.name}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}